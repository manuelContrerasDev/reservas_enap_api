import { prisma } from "@/lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";

export const DisponibilidadTipoRepository = {
  async contarReservasActivasPorTipoEnDia(
    tipo: TipoEspacio,
    diaInicio: Date,
    diaFin: Date
  ) {
    const now = new Date();

    return prisma.reserva.count({
      where: {
        tipoEspacio: tipo,

        // 🔐 Estados que BLOQUEAN disponibilidad
        OR: [
          // Confirmadas siempre bloquean
          { estado: ReservaEstado.CONFIRMADA },

          // Pendiente de validación SIEMPRE bloquea
          { estado: ReservaEstado.PENDIENTE_VALIDACION },

          // Pendiente de pago solo si no ha expirado
          {
            estado: ReservaEstado.PENDIENTE_PAGO,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
        ],

        // 🔑 Intersección de fechas
        AND: [
          { fechaInicio: { lte: diaFin } },
          { fechaFin: { gte: diaInicio } },
        ],
      },
    });
  },
};
