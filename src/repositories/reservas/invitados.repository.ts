// ============================================================
// invitados.repository.ts — ENAP 2025 (OFICIAL)
// ============================================================

import { prisma } from "../../lib/db";

interface InvitadoInput {
  nombre: string;
  rut: string;
  edad?: number | null;
}

export const InvitadosRepository = {

  /* --------------------------------------------------------
   * Obtener invitados de una reserva
   * -------------------------------------------------------- */
  obtenerPorReserva(reservaId: string) {
    return prisma.invitado.findMany({
      where: { reservaId },
    });
  },

  /* --------------------------------------------------------
   * Borrar invitados (uso normal y transacciones)
   * -------------------------------------------------------- */
  borrarPorReserva(reservaId: string) {
    return prisma.invitado.deleteMany({
      where: { reservaId },
    });
  },

  borrarPorReservaRaw(reservaId: string) {
    return prisma.invitado.deleteMany({
      where: { reservaId },
    });
  },

  /* --------------------------------------------------------
   * Crear lista de invitados (normal)
   * -------------------------------------------------------- */
  crearLista(reservaId: string, invitados: InvitadoInput[]) {
    if (!invitados || invitados.length === 0) {
      return prisma.invitado.deleteMany({ where: { reservaId } });
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

  /* --------------------------------------------------------
   * Crear lista dentro de transacción (RAW)
   * -------------------------------------------------------- */
  crearListaRaw(reservaId: string, invitados: InvitadoInput[]) {
    if (!Array.isArray(invitados) || invitados.length === 0) {
      return prisma.invitado.deleteMany({ where: { reservaId } });
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
