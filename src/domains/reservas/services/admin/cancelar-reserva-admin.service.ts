// src/domains/reservas/services/cancelar-reserva-admin.service.ts
import { prisma } from "../../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../../../types/global";
import { createAuditLogService } from "@/domains/audit/services/audit-log.service";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export const CancelarReservaAdminService = {
  async ejecutar(reservaId: string, admin: AuthUser, motivo?: string) {
    if (!admin?.id) throw new Error("NO_AUTH");
    if (admin.role !== "ADMIN") throw new Error("NO_AUTORIZADO_ADMIN");
    if (!motivo?.trim()) throw new Error("MOTIVO_REQUERIDO");

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, estado: true },
    });
    if (!reserva) throw new Error("NOT_FOUND");

    if (
      reserva.estado !== ReservaEstado.PENDIENTE_PAGO &&
      reserva.estado !== ReservaEstado.PENDIENTE_VALIDACION
    ) {
      throw new Error("RESERVA_NO_CANCELABLE");
    }

    const updated = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        estado: ReservaEstado.RECHAZADA,
        cancelledAt: new Date(),
        cancelledBy: "ADMIN",
      },
    });

    await createAuditLogService({
      action: AUDIT_ACTIONS.CANCELAR_RESERVA_ADMIN,
      entity: "RESERVA",
      entityId: reservaId,
      actor: admin,
      before: { estado: reserva.estado },
      after: { estado: ReservaEstado.RECHAZADA },
      details: { motivo: motivo.trim() },
    });

    return updated;
  },
};
