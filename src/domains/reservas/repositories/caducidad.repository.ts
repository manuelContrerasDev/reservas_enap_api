// src/repositories/reservas/caducidad.repository.ts

import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";

export type CaducarReservasOptions = {
  now?: Date;
  batchSize?: number;
};

// Tipado explícito del resultado (claridad + DX)
export type ReservaCaducableRow = {
  id: string;
};

export const ReservasCaducidadRepository = {
  /**
   * Obtiene reservas que deben caducar.
   *
   * Reglas:
   * - estado = PENDIENTE_PAGO
   * - expiresAt <= now
   *
   * batchSize defensivo: 1..1000
   */
  async findExpiradasIds(
    opts: CaducarReservasOptions = {}
  ): Promise<ReservaCaducableRow[]> {
    const now = opts.now ?? new Date();

    // 🔒 Límite defensivo (evita batch 0 o queries gigantes)
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
