// src/services/PagosService.ts
import { prisma } from "../../../lib/db";
import { WebpayProvider } from "../providers/WebpayProvider";
import { $Enums } from "@prisma/client";

/* ============================================================
 * 🧱 Tipos (alineados con Prisma)
 * ============================================================ */
type Role = $Enums.Role;
type ReservaEstado = $Enums.ReservaEstado;
type PaymentStatus = $Enums.PaymentStatus;

const ESTADOS_PAGO: PaymentStatus[] = [
  "CREATED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

/* ============================================================
 * 🔧 Helpers
 * ============================================================ */
function buildBuyOrder(id: string) {
  return id.replace(/-/g, "").slice(0, 26);
}

function buildSessionId(pagoId: string) {
  return `PAGO-${pagoId}-${Date.now()}`;
}

/* ============================================================
 * 🏦 PagosService — ENAP 2025 (Producción)
 * ============================================================ */
export class PagosService {
  /* ============================================================
   * 1) Crear intento de pago (Checkout)
   * - Respeta 1 pago por reserva (reservaId @unique)
   * - Evita duplicados
   * - Permite reintento si REJECTED/CANCELLED
   * ============================================================ */
  static async crearIntentoPago(params: {
    reservaId: string;
    userId: string;
    role: Role;
  }) {
    const reserva = await prisma.reserva.findUnique({
      where: { id: params.reservaId },
      include: { user: true, espacio: true },
    });

    if (!reserva) throw new Error("RESERVA_NOT_FOUND");

    // Permisos: ADMIN puede pagar cualquiera, otros solo las suyas
    const esAdmin = params.role === "ADMIN";
    if (!esAdmin && reserva.userId !== params.userId) {
      throw new Error("FORBIDDEN");
    }

    if (reserva.estado === "CONFIRMADA") throw new Error("RESERVA_YA_PAGADA");
    if (!reserva.totalClp || reserva.totalClp <= 0) throw new Error("MONTO_INVALIDO");

    // 1 pago por reserva
    const pagoExistente = await prisma.pago.findUnique({
      where: { reservaId: reserva.id },
    });

    if (pagoExistente) {
      if (pagoExistente.status === "APPROVED") throw new Error("PAGO_YA_APROBADO");
      if (pagoExistente.status === "PENDING") throw new Error("PAGO_YA_PENDIENTE");

      // Si fue REJECTED/CANCELLED -> reintento: reset mínimo
      if (pagoExistente.status === "REJECTED" || pagoExistente.status === "CANCELLED") {
        await prisma.pago.update({
          where: { id: pagoExistente.id },
          data: {
            status: "CREATED",
            token: null,
            sessionId: null,
            // buyOrder temporal se reemplaza más abajo
            buyOrder: "TEMP-" + Date.now(),
            responseCode: null,
            transactionDate: null,
            paymentTypeCode: null,
            rawResponse: undefined,
          },
        });
      }
    }

    const pago =
      pagoExistente ??
      (await prisma.pago.create({
        data: {
          reservaId: reserva.id,
          provider: "WEBPAY",
          amountClp: reserva.totalClp,
          status: "CREATED",
          buyOrder: "TEMP-" + Date.now(),
        },
      }));

    // buyOrder/sessionId definitivos
    const buyOrder = buildBuyOrder(pago.id);
    const sessionId = buildSessionId(pago.id);

    const webpayTx = await WebpayProvider.crearTransaccion({
      buyOrder,
      sessionId,
      amount: reserva.totalClp,
      returnUrl: process.env.WEBPAY_RETURN_URL!,
      finalUrl: process.env.WEBPAY_FINAL_URL!,
    });

    await prisma.pago.update({
      where: { id: pago.id },
      data: {
        buyOrder,
        sessionId,
        token: webpayTx.token,
        status: "PENDING",
        responseCode: null,
        transactionDate: null,
        paymentTypeCode: null,
        rawResponse: undefined,
      },
    });

    return {
      ok: true,
      pagoId: pago.id,
      checkoutUrl: webpayTx.url,
      token: webpayTx.token,
    };
  }

  /* ============================================================
   * 2) Obtener estado
   * ============================================================ */
  static async obtenerEstadoPago(id: string) {
    return prisma.pago.findUnique({
      where: { id },
      include: {
        reserva: { include: { espacio: true, user: true } },
      },
    });
  }

  /* ============================================================
   * 3) Procesar Webpay (confirmación)
   * - Idempotente (si ya está APPROVED/CANCELLED no re-procesa)
   * - Actualiza Pago + Reserva en transacción
   * - Valida monto de forma segura
   * ============================================================ */
  static async procesarWebpay(token_ws: string) {
    if (!token_ws) throw new Error("TOKEN_WS_INVALIDO");

    const pago = await prisma.pago.findFirst({
      where: { token: token_ws, provider: "WEBPAY" },
      include: { reserva: true },
    });

    if (!pago) throw new Error("PAGO_NOT_FOUND_FOR_TOKEN");

    // Idempotencia
    if (pago.status === "APPROVED" || pago.status === "CANCELLED") {
      return {
        status: pago.status,
        pagoId: pago.id,
        reservaId: pago.reservaId,
        responseCode: pago.responseCode ?? null,
        message: pago.status === "APPROVED" ? "Pago aprobado" : "Pago cancelado",
      };
    }

    const resp = await WebpayProvider.confirmar(token_ws);

    const responseCode =
      typeof resp.response_code === "number" ? resp.response_code : -999;

    const approved = resp.status === "AUTHORIZED" && responseCode === 0;

    const estadoPago: PaymentStatus = approved ? "APPROVED" : "REJECTED";
    const estadoReserva: ReservaEstado = approved ? "CONFIRMADA" : "RECHAZADA";

    // Validación de monto (solo si viene definido)
    if (typeof resp.amount === "number" && resp.amount !== pago.amountClp) {
      await prisma.$transaction([
        prisma.pago.update({
          where: { id: pago.id },
          data: {
            status: "REJECTED",
            responseCode,
            rawResponse: resp as any,
          },
        }),
        prisma.reserva.update({
          where: { id: pago.reservaId },
          data: { estado: "RECHAZADA" },
        }),
      ]);

      throw new Error("MONTO_INCONSISTENTE");
    }

    await prisma.$transaction([
      prisma.pago.update({
        where: { id: pago.id },
        data: {
          status: estadoPago,
          responseCode,
          transactionDate: resp.transaction_date ?? null,
          paymentTypeCode: resp.payment_type_code ?? null,
          rawResponse: resp as any,
        },
      }),
      prisma.reserva.update({
        where: { id: pago.reservaId },
        data: { estado: estadoReserva },
      }),
    ]);

    return {
      status: estadoPago,
      pagoId: pago.id,
      reservaId: pago.reservaId,
      responseCode,
      message: approved ? "Pago aprobado" : "Pago rechazado",
    };
  }

  /* ============================================================
   * ❌ Cancelación TBK_TOKEN
   * NO se procesa aquí: no hay forma segura de mapearlo a un pago
   * sin correlación confiable. Se maneja solo como "cancelled" en FE.
   * ============================================================ */

  /* ============================================================
   * 4) Pagos del usuario autenticado
   * ============================================================ */
  static async listarPagosUsuario(userId: string) {
    return prisma.pago.findMany({
      where: { reserva: { userId } },
      include: { reserva: { include: { espacio: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  /* ============================================================
   * 5) Listado de tesorería (admin)
   * ============================================================ */
  static async listarPagosAdmin(params: {
    estado?: string;
    desde?: string;
    hasta?: string;
    espacioId?: string;
  }) {
    const where: any = {};

    if (params.estado && ESTADOS_PAGO.includes(params.estado as PaymentStatus)) {
      where.status = params.estado;
    }

    if (params.espacioId) {
      where.reserva = { espacioId: params.espacioId };
    }

    if (params.desde || params.hasta) {
      where.createdAt = {};
      if (params.desde) where.createdAt.gte = new Date(params.desde);
      if (params.hasta) where.createdAt.lte = new Date(params.hasta);
    }

    return prisma.pago.findMany({
      where,
      include: {
        reserva: {
          include: {
            espacio: true,
            user: { select: { email: true, name: true, role: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
