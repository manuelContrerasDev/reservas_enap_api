import { prisma } from "@/lib/db";
import { ReservaEstado, Role } from "@prisma/client";
import type { AuthUser } from "@/types/global";

import { createAuditLogService } from "@/domains/audit/services/audit-log.service";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export const RechazarPagoAdminService = {
  async ejecutar(
    reservaId: string,
    admin: AuthUser,
    motivo: string
  ) {
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    const motivoLimpio = motivo?.trim();
    if (!motivoLimpio) {
      throw new Error("MOTIVO_REQUERIDO");
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    // 🔒 CONTRATO
    if (reserva.estado !== ReservaEstado.PENDIENTE_VALIDACION) {
      throw new Error("TRANSICION_INVALIDA");
    }

    return prisma.$transaction(async (tx) => {
      const reservaActualizada = await tx.reserva.update({
        where: { id: reservaId },
        data: {
          estado: ReservaEstado.RECHAZADA,
          cancelledAt: new Date(),
          cancelledBy: "ADMIN",
        },
      });

      await createAuditLogService({
        action: AUDIT_ACTIONS.RECHAZAR_PAGO,
        entity: "RESERVA",
        entityId: reserva.id,
        actor: admin,
        client: tx,
        before: { estado: reserva.estado },
        after: { estado: ReservaEstado.RECHAZADA },
        details: {
          motivo: motivoLimpio,
          montoEsperado: reserva.totalClp,
        },
      });

      return reservaActualizada;
    });
  },
};
