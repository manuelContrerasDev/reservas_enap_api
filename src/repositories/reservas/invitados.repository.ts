// src/repositories/reservas/invitados.repository.ts
import { prisma } from "../../config/db";

export const InvitadosRepository = {

  /** ============================================================
   * 📌 Obtener invitados de una reserva
   * ============================================================ */
  obtenerPorReserva(reservaId: string) {
    return prisma.invitado.findMany({
      where: { reservaId },
    });
  },

  /** ============================================================
   * 🗑 Borrar invitados (uso normal)
   * ============================================================ */
  borrarPorReserva(reservaId: string) {
    return prisma.invitado.deleteMany({
      where: { reservaId },
    });
  },

  /** ============================================================
   * 🗑 RAW: Borrar invitados (para transacciones)
   * Siempre devuelve un PrismaPromise
   * ============================================================ */
  borrarPorReservaRaw(reservaId: string) {
    return prisma.invitado.deleteMany({
      where: { reservaId },
    });
  },

  /** ============================================================
   * ➕ Crear lista de invitados (uso normal)
   * ============================================================ */
  crearLista(reservaId: string, invitados: any[]) {
    if (!invitados.length) {
      // No hacemos nada
      return prisma.$queryRaw`SELECT 1`;
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

  /** ============================================================
   * ➕ RAW: Crear lista dentro de transacción
   * Siempre devuelve un PrismaPromise
   * ============================================================ */
  crearListaRaw(reservaId: string, invitados: any[]) {
    if (!invitados.length) {
      return prisma.$queryRaw`SELECT 1`; // 🔵 SAFE
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
