// src/repositories/espacios/productos.repository.ts
import { prisma } from "../../lib/db";
import { TipoEspacio, ReservaEstado } from "@prisma/client";

export const ProductosEspaciosRepository = {
  /**
   * Todas las unidades activas y visibles de un producto (tipo)
   */
  findUnidadesActivasPorTipo(tipo: TipoEspacio) {
    return prisma.espacio.findMany({
      where: {
        tipo,
        activo: true,
        visible: true,
      },
      orderBy: { nombre: "asc" },
    });
  },

  /**
   * Conteo total de unidades activas por tipo
   */
  countUnidadesActivasPorTipo(tipo: TipoEspacio) {
    return prisma.espacio.count({
      where: {
        tipo,
        activo: true,
        visible: true,
      },
    });
  },

  /**
   * IDs de unidades ocupadas en un rango
   * (para disponibilidad agrupada)
   */
  findUnidadesOcupadasEnRango(
    tipo: TipoEspacio,
    inicio: Date,
    fin: Date
  ) {
    const now = new Date();

    return prisma.reserva.findMany({
      where: {
        espacio: {
          tipo,
          activo: true,
          visible: true,
        },
        OR: [
          { estado: ReservaEstado.CONFIRMADA },
          {
            estado: ReservaEstado.PENDIENTE_PAGO,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
        AND: [
          { fechaInicio: { lte: fin } },
          { fechaFin: { gte: inicio } },
        ],
      },
      select: {
        espacioId: true,
      },
    });
  },
};
