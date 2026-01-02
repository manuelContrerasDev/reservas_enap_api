// src/repositories/reservas/update.repository.ts
import { prisma } from "../../lib/db";
import { Prisma } from "@prisma/client";

export type InvitadoCreateInput = {
  nombre: string;
  rut: string;
  edad?: number | null;
  esPiscina?: boolean;
};

export const ReservasUpdateRepository = {
  obtenerReserva(tx: Prisma.TransactionClient, id: string) {
    return tx.reserva.findUnique({
      where: { id },
      include: { invitados: true, espacio: true },
    });
  },

  borrarInvitados(tx: Prisma.TransactionClient, reservaId: string) {
    return tx.invitado.deleteMany({ where: { reservaId } });
  },

  crearInvitados(
    tx: Prisma.TransactionClient,
    reservaId: string,
    invitados: InvitadoCreateInput[]
  ) {
    if (!Array.isArray(invitados) || invitados.length === 0) return;

    return tx.invitado.createMany({
      data: invitados.map((i) => ({
        reservaId,
        nombre: i.nombre.trim(),
        rut: i.rut.trim(),
        edad: i.edad ?? null,
        esPiscina: i.esPiscina ?? false,
      })),
    });
  },

  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(fn);
  },
};
