// ============================================================
// piscina.repository.ts — ENAP 2025 (FINAL)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";

export const PiscinaRepository = {

  /* --------------------------------------------------------
   * Obtener reservas ACTIVAS del día
   * -------------------------------------------------------- */
  reservasPorFecha(fecha: Date) {
    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: TipoEspacio.PISCINA },
        fechaInicio: fecha,
        estado: {
          in: [
            ReservaEstado.PENDIENTE_PAGO,
            ReservaEstado.CONFIRMADA,
          ],
        },
      },
      select: {
        cantidadPiscina: true,
      },
    });
  },

  /* --------------------------------------------------------
   * Obtener espacio piscina (único)
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
