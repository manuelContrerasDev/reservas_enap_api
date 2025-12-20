// src/services/espacios/socio/disponibilidad.service.ts

import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import { getEspacioOr404 } from "../helpers";

export async function disponibilidadService(id: string) {
  const espacio = await getEspacioOr404(id);

  const fechas = await prisma.reserva.findMany({
    where: {
      espacioId: id,
      estado: {
        in: [
          ReservaEstado.PENDIENTE,
          ReservaEstado.PENDIENTE_PAGO,
          ReservaEstado.CONFIRMADA,
        ],
      },
    },
    select: { fechaInicio: true, fechaFin: true },
    orderBy: { fechaInicio: "asc" },
  });

  return { id, fechas };
}
