// src/repositories/reservas/invitados.repository.ts
import { prisma } from "../../lib/db";

export interface InvitadoInput {
  nombre: string;
  rut: string;
  edad?: number | null;
  esPiscina?: boolean;
}

export const InvitadosRepository = {

  obtenerPorReserva(reservaId: string) {
    return prisma.invitado.findMany({
      where: { reservaId },
    });
  },

  borrarPorReserva(reservaId: string) {
    return prisma.invitado.deleteMany({
      where: { reservaId },
    });
  },

  crearLista(reservaId: string, invitados: InvitadoInput[]) {
    if (!invitados.length) return;

    return prisma.invitado.createMany({
      data: invitados.map(i => ({
        reservaId,
        nombre: i.nombre,
        rut: i.rut,
        edad: i.edad ?? null,
        esPiscina: i.esPiscina ?? false,
      })),
    });
  },
};
