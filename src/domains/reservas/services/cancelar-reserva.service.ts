// src/domains/reservas/services/cancelar-reserva.service.ts
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../../types/global";
import { ReservasCancelarRepository } from "../repositories/cancelar.repository";
import { prisma } from "../../../lib/db";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const CancelarReservaService = {
  async ejecutar(reservaId: string, user: AuthUser, motivo?: string) {
    if (!user?.id) throw new Error("NO_AUTH");

    const reserva = await ReservasCancelarRepository.obtenerLigera(reservaId);
    if (!reserva) throw new Error("NOT_FOUND");

    if (reserva.userId !== user.id) {
      throw new Error("NO_PERMITIDO");
    }

    if (
      reserva.estado !== ReservaEstado.PENDIENTE_PAGO &&
      reserva.estado !== ReservaEstado.PENDIENTE_VALIDACION
    ) {
      throw new Error("RESERVA_NO_CANCELABLE");
    }

    const hoy = startOfDay(new Date());
    const inicio = startOfDay(new Date(reserva.fechaInicio));
    if (hoy >= inicio) throw new Error("NO_PERMITIDO_TIEMPO");

    const updated = await ReservasCancelarRepository.actualizarEstado(
      reservaId,
      ReservaEstado.RECHAZADA,
      {
        cancelledAt: new Date(),
        cancelledBy: "USER",
      }
    );

    prisma.auditLog.create({
      data: {
        action: "CANCELAR_RESERVA_USUARIO",
        entity: "RESERVA",
        entityId: reservaId,
        userId: user.id,
        details: {
          from: reserva.estado,
          to: ReservaEstado.RECHAZADA,
          motivo: motivo?.trim() || null,
        },
      },
    }).catch(() => {});

    return updated;
  },
};
