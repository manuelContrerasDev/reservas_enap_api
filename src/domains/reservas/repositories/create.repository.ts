// ============================================================
// src/repositories/reservas/create.repository.ts
// ENAP 2025 — Production Ready
// ============================================================

import { Prisma } from "@prisma/client";

export const ReservasCreateRepository = {

  /* ============================================================
   * 🟢 CREAR RESERVA
   * ------------------------------------------------------------
   * CONTRATO:
   * - Se ejecuta DENTRO de una transacción
   * - Datos YA validados por el service
   * - Usa UncheckedCreateInput por performance
   * ============================================================ */
  async crearReserva(
    tx: Prisma.TransactionClient,
    data: Prisma.ReservaUncheckedCreateInput
  ) {
    try {
      return await tx.reserva.create({ data });
    } catch (error) {
      console.error("❌ [ReservasCreateRepository.crearReserva]", error);
      throw new Error("ERROR_CREAR_RESERVA");
    }
  },

  /* ============================================================
   * 👥 CREAR INVITADOS
   * ------------------------------------------------------------
   * - No retorna datos (fire & forget dentro de TX)
   * - Si no hay invitados, no hace nada
   * ============================================================ */
  async crearInvitados(
    tx: Prisma.TransactionClient,
    reservaId: string,
    invitados: Array<{
      nombre: string;
      rut: string;
      edad?: number | null;
      esPiscina?: boolean;
    }>
  ): Promise<void> {
    if (!invitados.length) return;

    try {
      await tx.invitado.createMany({
        data: invitados.map(i => ({
          reservaId,
          nombre: i.nombre.trim(),
          rut: i.rut.trim(),
          edad: i.edad ?? null,
          esPiscina: i.esPiscina ?? false,
        })),
      });
    } catch (error) {
      console.error("❌ [ReservasCreateRepository.crearInvitados]", error);
      throw new Error("ERROR_CREAR_INVITADOS");
    }
  },
};
