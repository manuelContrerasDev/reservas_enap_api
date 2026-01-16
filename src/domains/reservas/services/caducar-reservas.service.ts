// src/services/reservas/caducar-reservas.service.ts

import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import { ReservasCaducidadRepository } from "../repositories/caducidad.repository";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export type CaducarReservasResult = {
  scanned: number;
  caducadas: number;
  ids: string[];
};

export const CaducarReservasService = {
  /**
   * Ejecuta la caducidad automática de reservas.
   *
   * 🔹 Reglas ENAP:
   * - SOLO reservas en estado PENDIENTE_PAGO
   * - expiresAt <= now
   * - Flujo automático (CRON / SYSTEM)
   *
   * ❗ No valida pagos (módulo pago congelado)
   */
  async ejecutar(params?: {
    batchSize?: number;
    now?: Date;
  }): Promise<CaducarReservasResult> {
    const now = params?.now ?? new Date();
    const batchSize = params?.batchSize ?? 200;

    /* --------------------------------------------------------
     * 1) Buscar reservas candidatas a caducar
     * -------------------------------------------------------- */
    const candidatas = await ReservasCaducidadRepository.findExpiradasIds({
      now,
      batchSize,
    });

    const ids = candidatas.map((r) => r.id);

    if (ids.length === 0) {
      return {
        scanned: 0,
        caducadas: 0,
        ids: [],
      };
    }

    /* --------------------------------------------------------
     * 2) Transacción: caducar + audit log
     * -------------------------------------------------------- */
    const caducadas = await prisma.$transaction(async (tx) => {
      // 🔒 Defensa extra: evita caducar reservas ya mutadas
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

      // 🔐 Audit masivo (óptimo para CRON)
      await tx.auditLog.createMany({
        data: ids.map((id) => ({
          action: AUDIT_ACTIONS.RESERVA_CADUCADA_AUTOMATICA,
          entity: "RESERVA",
          entityId: id,
          userId: null,
          details: {
            trigger: "CRON",
            reason: "EXPIRES_AT",
            from: ReservaEstado.PENDIENTE_PAGO,
            to: ReservaEstado.CADUCADA,
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
