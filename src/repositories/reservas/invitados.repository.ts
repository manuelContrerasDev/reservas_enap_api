// src/repositories/reservas/invitados.repository.ts
// ============================================================
// InvitadosRepository — ENAP 2026 (PRODUCTION READY)
// - Repositorio simple (sin reglas de negocio)
// - Sanitiza strings (trim)
// - Retornos estables incluso con arrays vacíos
// ============================================================

import { prisma } from "../../lib/db";
import { Prisma } from "@prisma/client";

export interface InvitadoInput {
  nombre: string;
  rut: string;
  edad?: number | null;
  esPiscina?: boolean;
}

const sanitizeInvitado = (i: InvitadoInput) => ({
  nombre: i.nombre.trim(),
  rut: i.rut.trim(),
  edad: i.edad ?? null,
  esPiscina: i.esPiscina ?? false,
});

export const InvitadosRepository = {
  /**
   * Listado por reserva (orden estable)
   * Importante para UI: al re-render, mantiene consistencia visual.
   */
  obtenerPorReserva(reservaId: string) {
    return prisma.invitado.findMany({
      where: { reservaId },
      select: {
        id: true,
        nombre: true,
        rut: true,
        edad: true,
        esPiscina: true,
      },
    });
  },

  borrarPorReserva(reservaId: string) {
    return prisma.invitado.deleteMany({
      where: { reservaId },
    });
  },

  /**
   * Crea lista completa (bulk) con createMany.
   * Retorno estable: Prisma.BatchPayload siempre.
   */
  async crearLista(reservaId: string, invitados: InvitadoInput[]) {
    const data = Array.isArray(invitados)
      ? invitados.map(sanitizeInvitado).map((i) => ({
          reservaId,
          ...i,
        }))
      : [];

    if (data.length === 0) {
      // Retorno compatible con Prisma.BatchPayload
      return { count: 0 } satisfies Prisma.BatchPayload;
    }

    return prisma.invitado.createMany({
      data,
      skipDuplicates: false, // si quisieras dedupe por rut, eso es regla negocio -> service
    });
  },
};
