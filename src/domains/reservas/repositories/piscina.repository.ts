// src/repositories/reservas/piscina.repository.ts

import { prisma } from "../../../lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";

export const PiscinaRepository = {

  reservasPorDia(fecha: Date) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: TipoEspacio.PISCINA },
        estado: {
          in: [ReservaEstado.PENDIENTE_PAGO, ReservaEstado.CONFIRMADA],
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
        fechaInicio: { lte: finDia },
        fechaFin: { gte: inicioDia },
      },
      select: {
        cantidadPiscina: true,
      },
    });
  },

  obtenerEspacioPiscina() {
    return prisma.espacio.findFirst({
      where: { tipo: TipoEspacio.PISCINA },
      select: {
        id: true,
        capacidad: true,
      },
    });
  },
};
