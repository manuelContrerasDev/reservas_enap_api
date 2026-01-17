// src/repositories/reservas/piscina.repository.ts

import { prisma } from "../../../lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";

export const PiscinaRepository = {
  reservasPorDia(fecha: Date) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const now = new Date();

    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: TipoEspacio.PISCINA },

        // ✅ Estados que bloquean cupo piscina
        OR: [
          // Confirmadas siempre bloquean
          { estado: ReservaEstado.CONFIRMADA },

          // Pendiente de validación siempre bloquea
          { estado: ReservaEstado.PENDIENTE_VALIDACION },

          // Pendiente de pago solo si no ha expirado
          {
            estado: ReservaEstado.PENDIENTE_PAGO,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],

        // Solape de fechas
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
