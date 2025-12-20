// src/repositories/reservas/create.repository.ts

import { prisma } from "../../lib/db";
import { Prisma } from "@prisma/client";

export const ReservasCreateRepository = {

  /* ============================================================
   * 🟢 CREAR RESERVA (Optimizado para ENAP 2025)
   * ============================================================ */
  async crearReserva(data: Prisma.ReservaUncheckedCreateInput) {
    try {
      const reserva = await prisma.reserva.create({ data });
      return reserva;

    } catch (error) {
      console.error("❌ [Repo] Error al crear reserva:", error);
      throw new Error("ERROR_CREAR_RESERVA");
    }
  },

  /* ============================================================
   * 👥 CREAR INVITADOS
   * ============================================================ */
  async crearInvitados(
    reservaId: string,
    invitados: Array<{ nombre: string; rut: string; edad?: number | null }>
  ) {
    if (!invitados.length) return;

    try {
      await prisma.invitado.createMany({
        data: invitados.map((i) => ({
          reservaId,
          nombre: i.nombre.trim(),
          rut: i.rut.trim(),
          edad: i.edad ?? null,
          // esPiscina queda como default(false)
        })),
      });

    } catch (error) {
      console.error("❌ [Repo] Error al crear invitados:", error);
      throw new Error("ERROR_CREAR_INVITADOS");
    }
  },
};
