import { prisma } from "../../lib/db";
import { ReservaEstado, Role } from "@prisma/client";
import { ReservasAdminRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";

const ADMIN_TRANSITIONS: Record<ReservaEstado, readonly ReservaEstado[]> = {
  PENDIENTE_PAGO: [
    ReservaEstado.PENDIENTE_PAGO,
    ReservaEstado.CONFIRMADA,
    ReservaEstado.RECHAZADA,
    ReservaEstado.CANCELADA,
    ReservaEstado.CADUCADA,
  ],
  CONFIRMADA: [
    ReservaEstado.CONFIRMADA,
    ReservaEstado.FINALIZADA,
    ReservaEstado.CANCELADA,
  ],
  RECHAZADA: [ReservaEstado.RECHAZADA, ReservaEstado.PENDIENTE_PAGO],
  CANCELADA: [ReservaEstado.CANCELADA],
  CADUCADA: [ReservaEstado.CADUCADA],
  FINALIZADA: [ReservaEstado.FINALIZADA],
};

function isTransitionAllowed(from: ReservaEstado, to: ReservaEstado): boolean {
  return ADMIN_TRANSITIONS[from]?.includes(to) ?? false;
}

export const ActualizarEstadoReservaService = {
  async ejecutar(id: string, nuevoEstado: ReservaEstado, adminUser: AuthUser) {
    // 0) ADMIN only
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    // 1) Validación de entrada defensiva
    if (!nuevoEstado) throw new Error("ESTADO_REQUERIDO");
    if (!Object.values(ReservaEstado).includes(nuevoEstado)) {
      throw new Error("ESTADO_INVALIDO");
    }

    // 2) Obtener estado actual
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      select: { id: true, estado: true },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    const estadoActual = reserva.estado;

    // ✅ Idempotencia: si ya está en ese estado, no actualizamos ni loggeamos doble
    if (estadoActual === nuevoEstado) {
      return ReservasAdminRepository.obtenerPorId(id);
    }

    // 3) Validar transición
    if (!isTransitionAllowed(estadoActual, nuevoEstado)) {
      throw new Error("TRANSICION_INVALIDA");
    }

    // 4) Persistir
    const reservaActualizada = await ReservasAdminRepository.actualizarEstado(
      id,
      nuevoEstado
    );

    // 5) AuditLog (no bloqueante)
    prisma.auditLog
      .create({
        data: {
          action: "ACTUALIZAR_ESTADO_RESERVA",
          entity: "Reserva",
          entityId: id,
          userId: adminUser.id,
          details: {
            estadoAnterior: estadoActual,
            nuevoEstado,
          },
        },
      })
      .catch(() => {});

    return reservaActualizada;
  },
};
