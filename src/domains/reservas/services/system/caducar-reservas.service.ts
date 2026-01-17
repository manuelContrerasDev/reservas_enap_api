// src/domains/reservas/services/caducar-reservas.service.ts
import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import { ReservasCaducidadRepository } from "../repositories/caducidad.repository";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export const CaducarReservasService = {
  async ejecutar(params?: { batchSize?: number; now?: Date }) {
    const now = params?.now ?? new Date();
    const batchSize = params?.batchSize ?? 200;

    const candidatas = await ReservasCaducidadRepository.findExpiradasIds({
      now,
      batchSize,
    });

    const ids = candidatas.map((r) => r.id);
    if (ids.length === 0) {
      return { scanned: 0, caducadas: 0, ids: [] };
    }

    const caducadas = await prisma.$transaction(async (tx) => {
      const updated = await tx.reserva.updateMany({
        where: {
          id: { in: ids },
          estado: ReservaEstado.PENDIENTE_PAGO,
        },
        data: {
          estado: ReservaEstado.CADUCADA,
          cancelledAt: now,
          cancelledBy: "SYSTEM",
        },
      });

      await tx.auditLog.createMany({
        data: ids.map((id) => ({
          action: AUDIT_ACTIONS.RESERVA_CADUCADA_AUTOMATICA,
          entity: "RESERVA",
          entityId: id,
          userId: null,
          details: {
            from: ReservaEstado.PENDIENTE_PAGO,
            to: ReservaEstado.CADUCADA,
            trigger: "CRON",
            executedAt: now,
          },
        })),
      });

      return updated.count;
    });

    return {
      scanned: candidatas.length,
      caducadas,
      ids,
    };
  },
};
