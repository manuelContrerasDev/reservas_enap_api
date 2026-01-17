// ============================================================
// src/domains/reservas/repositories/cancelar.repository.ts
// ENAP 2026 — Sync con contrato Reservas
// ============================================================

import { prisma } from "../../../lib/db";
import { Prisma, ReservaEstado } from "@prisma/client";

const includeReserva = {
  espacio: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      capacidad: true,
      imagenUrl: true,
    },
  },
  invitados: {
    select: {
      id: true,
      nombre: true,
      rut: true,
      edad: true,
      esPiscina: true,
    },
  },
  pago: {
    select: {
      id: true,
      status: true,
      amountClp: true,
      transactionDate: true,
    },
  },
} satisfies Prisma.ReservaInclude;

export const ReservasCancelarRepository = {
  /**
   * Reserva ligera para validaciones de service
   */
  obtenerLigera(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        estado: true,
        fechaInicio: true,
        fechaFin: true,
        createdAt: true,
        expiresAt: true,
        cancelledAt: true,
        cancelledBy: true,
      },
    });
  },

  /**
   * Actualiza estado de reserva (GENÉRICO)
   * ⚠️ Reglas de negocio se validan en el service
   */
  actualizarEstado(
    id: string,
    estado: ReservaEstado,
    extra?: {
      cancelledAt?: Date;
      cancelledBy?: "USER" | "ADMIN" | "SYSTEM";
    }
  ) {
    return prisma.reserva.update({
      where: { id },
      data: {
        estado,
        ...extra,
      },
      include: includeReserva,
    });
  },
};
