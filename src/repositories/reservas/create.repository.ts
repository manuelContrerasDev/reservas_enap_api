// src/repositories/reservas/create.repository.ts

import { prisma } from "../../config/db";
import { Prisma } from "@prisma/client";

export const ReservasCreateRepository = {

  /* ============================================================
   * 🟢 CREAR RESERVA (UNLOCKED / UNCHECKED INPUT)
   * ============================================================ */
  crearReserva(data: Prisma.ReservaUncheckedCreateInput) {
    return prisma.reserva.create({
      data,
    });
  },

  /* ============================================================
   * 👥 CREAR INVITADOS ASOCIADOS A UNA RESERVA
   * ============================================================ */
  crearInvitados(
    reservaId: string,
    invitados: Array<{ nombre: string; rut: string; edad?: number | null }>
  ) {
    if (!invitados.length) {
      // mantenemos la firma async-compatible
      return Promise.resolve();
    }

    return prisma.invitado.createMany({
      data: invitados.map((i) => ({
        reservaId,
        nombre: i.nombre,
        rut: i.rut,
        edad: i.edad ?? null,
      })),
    });
  },
};
