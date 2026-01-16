// src/repositories/espacios/disponibilidad.repository.ts
import { prisma } from "../../../lib/db";
import { Prisma, ReservaEstado } from "@prisma/client";

export const DisponibilidadEspacioRepository = {
  contarReservasSolapadas(espacioId: string, inicio: Date, fin: Date) {
    const now = new Date();

    return prisma.reserva.count({
      where: {
        espacioId,

        // ✅ Solo estados que bloquean disponibilidad
        OR: [
          // Confirmada siempre bloquea
          { estado: ReservaEstado.CONFIRMADA },

          // Pendiente bloquea solo si NO está expirada
          {
            estado: ReservaEstado.PENDIENTE_PAGO,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],

        // ✅ Overlap estándar: A solapa con B si
        // fechaInicio <= fin AND fechaFin >= inicio
        AND: [{ fechaInicio: { lte: fin } }, { fechaFin: { gte: inicio } }],
      },
    });
  },

  obtenerEspacio(espacioId: string) {
    return prisma.espacio.findUnique({
      where: { id: espacioId },
      select: {
        id: true,
        tipo: true,
        capacidad: true,
        activo: true,
      },
    });
  },
} satisfies Record<string, any>;
