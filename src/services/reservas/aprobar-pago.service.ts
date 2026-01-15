import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../types/global";
import { createAuditLogService } from "@/services/audit/audit-log.service";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

interface AprobarPagoPayload {
  monto?: number;
  referencia?: string;
  nota?: string;
}

export async function aprobarPagoService(
  reservaId: string,
  admin: AuthUser,
  payload: AprobarPagoPayload = {}
) {
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("NO_AUTORIZADO_ADMIN");
  }

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
  });

  if (!reserva) throw new Error("NOT_FOUND");

  // 🔒 Defensa extra ante estados corruptos
  if (reserva.confirmedAt) {
    throw new Error("YA_CONFIRMADA");
  }

  if (reserva.estado !== ReservaEstado.PENDIENTE_PAGO) {
    throw new Error("TRANSICION_INVALIDA");
  }

  if (!reserva.comprobanteUrl) {
    throw new Error("COMPROBANTE_REQUERIDO");
  }

  const montoClp = payload.monto ?? reserva.totalClp;
  if (!Number.isFinite(montoClp) || montoClp <= 0) {
    throw new Error("MONTO_INVALIDO");
  }

  return prisma.$transaction(async (tx) => {
    const reservaActualizada = await tx.reserva.update({
      where: { id: reservaId },
      data: {
        estado: ReservaEstado.CONFIRMADA,
        confirmedAt: new Date(),
        confirmedBy: admin.id,
        expiresAt: null,
      },
    });

    const movimiento = await tx.movimientoTesoreria.create({
      data: {
        reservaId,
        montoClp: Math.trunc(montoClp),
        referencia: payload.referencia?.trim() || null,
        nota: payload.nota?.trim() || null,
        creadoPorId: admin.id,
      },
    });

    await createAuditLogService({
      action: AUDIT_ACTIONS.APROBAR_PAGO,
      entity: "RESERVA",
      entityId: reserva.id,
      actor: admin,
      client: tx,
      before: {
        estado: reserva.estado,
        totalClp: reserva.totalClp,
      },
      after: {
        estado: ReservaEstado.CONFIRMADA,
        totalClp: movimiento.montoClp,
      },
      details: {
        referencia: movimiento.referencia,
        nota: movimiento.nota,
      },
    });

    return reservaActualizada;
  });
}
