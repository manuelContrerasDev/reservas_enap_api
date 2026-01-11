// src/services/reservas/confirmar-reserva-manual.service.ts
import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../types/global";

export const ConfirmarReservaManualService = {
  async ejecutar(reservaId: string, admin: AuthUser) {
    if (!admin || admin.role !== "ADMIN") {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: {
        id: true,
        estado: true,
        comprobanteUrl: true,
      },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    if (reserva.estado !== ReservaEstado.PENDIENTE_PAGO) {
      throw new Error("TRANSICION_INVALIDA");
    }

    if (!reserva.comprobanteUrl) {
      throw new Error("COMPROBANTE_REQUERIDO");
    }

    return prisma.reserva.update({
      where: { id: reservaId },
      data: {
        estado: ReservaEstado.CONFIRMADA,
        confirmedAt: new Date(),
        confirmedBy: admin.id,
        expiresAt: null, // 🔒 evita caducidad
      },
    });
  },
};
