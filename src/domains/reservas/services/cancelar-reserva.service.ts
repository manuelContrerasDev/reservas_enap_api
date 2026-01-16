// src/services/reservas/cancelar-reserva.service.ts
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

    // ✅ Regla de negocio: SOLO si está PENDIENTE_PAGO
    if (reserva.estado !== ReservaEstado.PENDIENTE_PAGO) {
      throw new Error("RESERVA_NO_CANCELABLE");
    }

    // ✅ Regla temporal: nunca cancelar el mismo día o después
    const hoy = startOfDay(new Date());
    const inicio = startOfDay(new Date(reserva.fechaInicio));
    if (hoy >= inicio) throw new Error("NO_PERMITIDO_TIEMPO");

    // ✅ Regla 24h: si existe expiresAt (tu modelo lo tiene)
    if (reserva.expiresAt && new Date() >= new Date(reserva.expiresAt)) {
      throw new Error("RESERVA_CADUCADA");
    }

    const reservaActualizada = await ReservasCancelarRepository.cancelarPorUsuario(reservaId);

    // AuditLog no bloqueante (incluye motivo si llega)
    prisma.auditLog
      .create({
        data: {
          action: "CANCELAR_RESERVA_USUARIO",
          entity: "Reserva",
          entityId: reservaId,
          userId: user.id,
          details: {
            estadoAnterior: reserva.estado,
            nuevoEstado: "CANCELADA",
            motivo: motivo ?? null,
            expiresAt: reserva.expiresAt ?? null,
          },
        },
      })
      .catch(() => {});

    return reservaActualizada;
  },
};
