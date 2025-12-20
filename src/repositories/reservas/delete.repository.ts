// src/repositories/reservas/delete.repository.ts

import { prisma } from "../../lib/db";

export const ReservasDeleteRepository = {

  /* ============================================================
   * 🔍 VERIFICAR EXISTENCIA
   * ============================================================ */
  existe(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      select: { id: true },
    });
  },

  /* ============================================================
   * 🧹 ELIMINAR INVITADOS
   * ============================================================ */
  eliminarInvitados(reservaId: string) {
    return prisma.invitado.deleteMany({
      where: { reservaId },
    });
  },

  /* ============================================================
   * 💳 ELIMINAR PAGO ASOCIADO
   * ============================================================ */
  eliminarPago(reservaId: string) {
    return prisma.pago.deleteMany({
      where: { reservaId },
    });
  },

  /* ============================================================
   * ❌ ELIMINAR RESERVA
   * ============================================================ */
  eliminarReserva(id: string) {
    return prisma.reserva.delete({
      where: { id },
    });
  },

};
