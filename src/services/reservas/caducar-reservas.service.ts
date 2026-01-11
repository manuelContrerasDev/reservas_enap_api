import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";
import { ReservasCaducidadRepository } from "../../repositories/reservas/caducidad.repository";

export type CaducarReservasResult = {
  scanned: number;
  caducadas: number;
  ids: string[];
};

export const CaducarReservasService = {
  /**
   * Ejecuta la caducidad automática de reservas.
   *
   * 🔹 Reglas ENAP 2025:
   * - SOLO reservas en estado PENDIENTE_PAGO
   * - expiresAt <= now
   * - El módulo de pago está congelado → NO se valida pago
   *
   * Pensado para ejecutarse vía CRON.
   */
  async ejecutar(params?: {
    batchSize?: number;
    now?: Date;
  }): Promise<CaducarReservasResult> {
    const now = params?.now ?? new Date();
    const batchSize = params?.batchSize ?? 200;

    /* --------------------------------------------------------
     * 1) Buscar reservas expiradas
     * -------------------------------------------------------- */
    const candidatas = await ReservasCaducidadRepository.findExpiradasIds({
      now,
      batchSize,
    });

    const ids = candidatas.map((r) => r.id);

    if (ids.length === 0) {
      return { scanned: 0, caducadas: 0, ids: [] };
    }

    /* --------------------------------------------------------
     * 2) Transacción: caducar + audit log
     * -------------------------------------------------------- */
    const caducadas = await prisma.$transaction(async (tx) => {
      const updated = await tx.reserva.updateMany({
        where: { id: { in: ids } },
        data: {
          estado: ReservaEstado.CADUCADA,
          cancelledAt: now,
          cancelledBy: "SYSTEM",
        },
      });

      await tx.auditLog.createMany({
        data: ids.map((id) => ({
          action: "RESERVA_CADUCADA_AUTOMATICA",
          entity: "Reserva",
          entityId: id,
          userId: null,
          details: {
            reason: "EXPIRES_AT",
            nuevoEstado: "CADUCADA",
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
