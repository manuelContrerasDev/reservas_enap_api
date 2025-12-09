// src/repositories/reservas/piscina.repository.ts

import { prisma } from "../../config/db";

export const PiscinaRepository = {

  reservasPorFecha(fecha: Date) {
    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: "PISCINA" },
        fechaInicio: fecha,
        estado: { not: "CANCELADA" },
      },
      select: { cantidadPersonas: true },
    });
  },

};
