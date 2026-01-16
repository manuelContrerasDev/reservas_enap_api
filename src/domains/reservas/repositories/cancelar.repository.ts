// src/repositories/reservas/cancelar.repository.ts
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
        expiresAt: true, // ✅ CLAVE PARA REGLA 24H

        cancelledAt: true,
        cancelledBy: true,
      },
    });
  },

  cancelarPorUsuario(id: string) {
    return prisma.reserva.update({
      where: { id },
      data: {
        estado: ReservaEstado.CANCELADA,
        cancelledAt: new Date(),
        cancelledBy: "USER",
      },
      include: includeReserva,
    });
  },

  cancelarPorAdmin(id: string) {
    return prisma.reserva.update({
      where: { id },
      data: {
        estado: ReservaEstado.CANCELADA,
        cancelledAt: new Date(),
        cancelledBy: "ADMIN",
      },
      include: includeReserva,
    });
  },
};
