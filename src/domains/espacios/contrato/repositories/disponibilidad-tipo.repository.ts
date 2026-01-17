// src/domains/espacios/contrato/repositories/disponibilidad-tipo.repository.ts
import { prisma } from "@/lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";

export const DisponibilidadTipoRepository = {
  async contarReservasActivasPorTipoEnDia(tipo: TipoEspacio, diaInicio: Date, diaFin: Date) {
    const now = new Date();

    return prisma.reserva.count({
      where: {
        tipoEspacio: tipo,
        OR: [
          { estado: ReservaEstado.CONFIRMADA },
          { estado: ReservaEstado.PENDIENTE_PAGO, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ],
        AND: [{ fechaInicio: { lte: diaFin } }, { fechaFin: { gte: diaInicio } }],
      },
    });
  },
};
