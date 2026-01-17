// ============================================================
// src/domains/reservas/repositories/caducidad.repository.ts
// ENAP 2025 — Production Ready
// ============================================================

import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";

export type CaducarReservasOptions = {
  now?: Date;
  batchSize?: number;
};

// Tipado explícito del resultado (DX + claridad)
export type ReservaCaducableRow = {
  id: string;
};

export const ReservasCaducidadRepository = {
  /**
   * Obtiene reservas que deben caducar.
   *
   * 🔐 Reglas CONTRACTUALES:
   * - estado = PENDIENTE_PAGO
   * - expiresAt IS NOT NULL
   * - expiresAt <= now
   * - NO incluye PENDIENTE_VALIDACION
   *
   * batchSize defensivo: 1..1000
   */
  async findExpiradasIds(
    opts: CaducarReservasOptions = {}
  ): Promise<ReservaCaducableRow[]> {
    const now = opts.now ?? new Date();

    // 🔒 Límite defensivo
    const take = Math.max(1, Math.min(opts.batchSize ?? 200, 1000));

    return prisma.reserva.findMany({
      where: {
        estado: ReservaEstado.PENDIENTE_PAGO,
        expiresAt: {
          not: null,
          lte: now,
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        expiresAt: "asc",
      },
      take,
    });
  },
};
