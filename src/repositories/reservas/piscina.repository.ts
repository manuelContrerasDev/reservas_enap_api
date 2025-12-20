// ============================================================
// piscina.repository.ts — ENAP 2025
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";

export const PiscinaRepository = {

  /* --------------------------------------------------------
   * Obtener reservas del día
   * -------------------------------------------------------- */
  reservasPorFecha(fecha: Date) {
    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: TipoEspacio.PISCINA },
        fechaInicio: fecha,
        estado: { not: ReservaEstado.CANCELADA },
      },
      select: {
        cantidadPiscina: true,
      },
    });
  },

  /* --------------------------------------------------------
   * Obtener espacio piscina
   * (solo debe existir 1 en ENAP)
   * -------------------------------------------------------- */
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
