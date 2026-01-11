import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";

export type CaducarReservasOptions = {
  now?: Date;
  batchSize?: number;
};

export const ReservasCaducidadRepository = {
  /**
   * Obtiene reservas que deben caducar.
   *
   * Reglas:
   * - estado = PENDIENTE_PAGO
   * - expiresAt <= now
   */
  async findExpiradasIds(opts: CaducarReservasOptions = {}) {
    const now = opts.now ?? new Date();
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
