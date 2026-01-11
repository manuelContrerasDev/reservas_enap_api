// src/repositories/reservas/update.repository.ts
// ============================================================
// ReservasUpdateRepository — ENAP 2026 (PRODUCTION READY)
// - Helpers para operar dentro de tx
// - No contiene reglas de negocio
// - Sanitiza strings (trim)
// - Retornos estables en createMany (BatchPayload)
// ============================================================

import { prisma } from "../../lib/db";
import { Prisma } from "@prisma/client";

export type InvitadoCreateInput = {
  nombre: string;
  rut: string;
  edad?: number | null;
  esPiscina?: boolean;
};

const sanitizeInvitado = (i: InvitadoCreateInput) => ({
  nombre: i.nombre.trim(),
  rut: i.rut.trim(),
  edad: i.edad ?? null,
  esPiscina: i.esPiscina ?? false,
});

export const ReservasUpdateRepository = {
  /**
   * Obtiene reserva con relaciones necesarias para validaciones de service
   */
  obtenerReserva(tx: Prisma.TransactionClient, id: string) {
    return tx.reserva.findUnique({
      where: { id },
      include: {
        invitados: true,
        espacio: true,
        user: true, // útil para auth checks en service (sin requery)
      },
    });
  },

  borrarInvitados(tx: Prisma.TransactionClient, reservaId: string) {
    return tx.invitado.deleteMany({ where: { reservaId } });
  },

  async crearInvitados(
    tx: Prisma.TransactionClient,
    reservaId: string,
    invitados: InvitadoCreateInput[]
  ) {
    const list = Array.isArray(invitados)
      ? invitados.map(sanitizeInvitado)
      : [];

    if (list.length === 0) {
      return { count: 0 } satisfies Prisma.BatchPayload;
    }

    return tx.invitado.createMany({
      data: list.map((i) => ({
        reservaId,
        ...i,
      })),
    });
  },

  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(fn);
  },
};
