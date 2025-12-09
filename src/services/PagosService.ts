// src/services/PagosService.ts
import {prisma} from "../config/db";
import { WebpayProvider } from "../providers/WebpayProvider";

/* ============================================================
 * 🧱 Tipos
 * ============================================================ */

type Role = "ADMIN" | "SOCIO" | "INVITADO";
type ReservaEstado = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "RECHAZADA";

type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

/* Estados válidos */
const ESTADOS_PAGO: PaymentStatus[] = [
  "CREATED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

/* ============================================================
 * 🔧 Helpers reutilizables
 * ============================================================ */

/** Limpia todos los campos de metadata de Webpay */
const resetMetadata = {
  responseCode: null,
  responseMessage: null,
  transactionDate: null,
  accountingDate: null,
  paymentTypeCode: null,
  installmentsNumber: null,
  rawResponse: undefined,
};

/** Genera un buyOrder válido (máx 26 chars) */
function buildBuyOrder(id: string) {
  return id.replace(/-/g, "").slice(0, 26);
}

/** Genera un sessionId interno único */
function buildSessionId(pagoId: string) {
  return `PAGO-${pagoId}-${Date.now()}`;
}

/* ============================================================
 * 🏦 PagosService (Producción)
 * ============================================================ */
export class PagosService {
  /* ============================================================
   * 1) Crear intento de pago (Checkout)
   * ============================================================ */
  static async crearIntentoPago(params: {
    reservaId: string;
    userId: string;
    role: Role;
  }) {
    if (params.role === "INVITADO")
      throw new Error("Los invitados no pueden realizar pagos.");

    const reserva = await prisma.reserva.findUnique({
      where: { id: params.reservaId },
      include: { user: true, espacio: true },
    });

    if (!reserva) throw new Error("Reserva no encontrada.");

    if (params.role === "SOCIO" && reserva.userId !== params.userId) {
      throw new Error("No puedes pagar reservas que no te pertenecen.");
    }

    if (reserva.estado === "CONFIRMADA")
      throw new Error("La reserva ya está pagada.");

    if (!reserva.totalClp || reserva.totalClp <= 0)
      throw new Error("El monto de la reserva es inválido.");

    // Crear o actualizar intento de pago
    const pago = await prisma.pago.upsert({
      where: { reservaId: reserva.id },
      update: {
        amountClp: reserva.totalClp,
        status: "PENDING",
      },
      create: {
        reservaId: reserva.id,
        provider: "WEBPAY",
        amountClp: reserva.totalClp,
        status: "CREATED",
      },
    });

    const buyOrder = buildBuyOrder(pago.id);
    const sessionId = buildSessionId(pago.id);

    const webpayTx = await WebpayProvider.crearTransaccion({
      buyOrder,
      sessionId,
      amount: pago.amountClp,
      returnUrl: process.env.WEBPAY_RETURN_URL!,
      finalUrl: process.env.WEBPAY_FINAL_URL!,
    });

    // Guardar el token_ws + metadata limpia
    await prisma.pago.update({
      where: { id: pago.id },
      data: {
        token: webpayTx.token,
        buyOrder,
        sessionId,
        status: "PENDING",
        ...resetMetadata,
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
   * 2) Obtener estado de un pago
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
   * 3) Procesar retorno Webpay (token_ws)
   * ============================================================ */
  static async procesarWebpay(token_ws: string) {
    if (!token_ws) throw new Error("token_ws inválido.");

    const pago = await prisma.pago.findFirst({
      where: { token: token_ws, provider: "WEBPAY" },
      include: { reserva: true },
    });

    if (!pago) throw new Error("Pago no encontrado para este token.");

    // Ya procesado → evitar confirmación doble
    if (pago.status === "APPROVED" || pago.status === "CANCELLED") {
      return {
        status: pago.status,
        pagoId: pago.id,
        reservaId: pago.reservaId,
        responseCode: pago.responseCode ?? null,
        message: pago.responseMessage ?? null,
      };
    }

    const resp = await WebpayProvider.confirmar(token_ws);

    // Campos Webpay útiles
    const responseCode =
      typeof resp.response_code === "number" ? resp.response_code : -999;

    const approved =
      resp.status === "AUTHORIZED" && responseCode === 0;

    const message =
      approved ? "Transacción aprobada" : "Transacción rechazada o con error";

    // Validación obligatoria de monto
    if (resp.amount !== pago.amountClp) {
      await prisma.pago.update({
        where: { id: pago.id },
        data: {
          status: "REJECTED",
          responseCode,
          responseMessage: "Monto inconsistente",
          rawResponse: resp as any,
        },
      });

      await prisma.reserva.update({
        where: { id: pago.reservaId },
        data: { estado: "RECHAZADA" },
      });

      throw new Error("Monto inconsistente. Pago rechazado por seguridad.");
    }

    // Determinar resultados
    const estadoPago: PaymentStatus = approved
      ? "APPROVED"
      : "REJECTED";

    const estadoReserva: ReservaEstado = approved
      ? "CONFIRMADA"
      : "RECHAZADA";

    // Actualizar pago con metadata
    await prisma.pago.update({
      where: { id: pago.id },
      data: {
        status: estadoPago,
        responseCode,
        responseMessage: message,
        transactionDate: resp.transaction_date ?? null,
        accountingDate: resp.accounting_date ?? null,
        paymentTypeCode: resp.payment_type_code ?? null,
        installmentsNumber: resp.installments_number ?? null,
        rawResponse: resp as any,
      },
    });

    // Actualizar reserva
    await prisma.reserva.update({
      where: { id: pago.reservaId },
      data: { estado: estadoReserva },
    });

    return {
      status: estadoPago,
      pagoId: pago.id,
      reservaId: pago.reservaId,
      responseCode,
      message,
    };
  }

  /* ============================================================
   * 3-BIS) Procesar cancelación TBK_TOKEN
   * ============================================================ */
  static async procesarCancelacion(tbkToken: string) {
    if (!tbkToken) throw new Error("TBK_TOKEN inválido.");

    const pagoPendiente = await prisma.pago.findFirst({
      where: { provider: "WEBPAY", status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    if (!pagoPendiente)
      throw new Error("No se encontró pago pendiente para cancelar.");

    await prisma.pago.update({
      where: { id: pagoPendiente.id },
      data: {
        status: "CANCELLED",
        responseMessage: "Pago cancelado por el usuario (TBK_TOKEN).",
      },
    });

    await prisma.reserva.update({
      where: { id: pagoPendiente.reservaId },
      data: { estado: "CANCELADA" },
    });

    return {
      status: "CANCELLED" as const,
      pagoId: pagoPendiente.id,
      reservaId: pagoPendiente.reservaId,
    };
  }

  /* ============================================================
   * 4) Pagos del usuario autenticado
   * ============================================================ */
  static async listarPagosUsuario(userId: string) {
    return prisma.pago.findMany({
      where: { reserva: { userId } },
      include: {
        reserva: { include: { espacio: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /* ============================================================
   * 5) Listado admin (Tesorería)
   * ============================================================ */
  static async listarPagosAdmin(params: {
    estado?: string;
    desde?: string;
    hasta?: string;
    espacioId?: string;
  }) {
    const where: any = {};

    if (params.estado && ESTADOS_PAGO.includes(params.estado as PaymentStatus))
      where.status = params.estado;

    if (params.espacioId)
      where.reserva = { espacioId: params.espacioId };

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
