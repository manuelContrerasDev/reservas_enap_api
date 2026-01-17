import { prisma } from "@/lib/db";
import { ReservaEstado, Role } from "@prisma/client";
import type { AuthUser } from "@/types/global";

import { ReservasAdminRepository } from "@/domains/reservas/repositories";

const ADMIN_TRANSITIONS: Record<ReservaEstado, readonly ReservaEstado[]> = {
  PENDIENTE_PAGO: [
    ReservaEstado.PENDIENTE_PAGO,
    ReservaEstado.PENDIENTE_VALIDACION,
    ReservaEstado.CONFIRMADA,
    ReservaEstado.RECHAZADA,
    ReservaEstado.CADUCADA,
  ],
  PENDIENTE_VALIDACION: [
    ReservaEstado.PENDIENTE_VALIDACION,
    ReservaEstado.CONFIRMADA,
    ReservaEstado.RECHAZADA,
  ],
  CONFIRMADA: [ReservaEstado.CONFIRMADA, ReservaEstado.FINALIZADA],
  RECHAZADA: [ReservaEstado.RECHAZADA],
  CADUCADA: [ReservaEstado.CADUCADA],
  FINALIZADA: [ReservaEstado.FINALIZADA],
};

function isTransitionAllowed(
  from: ReservaEstado,
  to: ReservaEstado
): boolean {
  return ADMIN_TRANSITIONS[from]?.includes(to) ?? false;
}

export const ActualizarEstadoAdminService = {
  async ejecutar(
    reservaId: string,
    nuevoEstado: ReservaEstado,
    adminUser: AuthUser
  ) {
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, estado: true },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    if (reserva.estado === nuevoEstado) {
      return ReservasAdminRepository.obtenerPorId(reservaId);
    }

    if (!isTransitionAllowed(reserva.estado, nuevoEstado)) {
      throw new Error("TRANSICION_INVALIDA");
    }

    const updated = await ReservasAdminRepository.actualizarEstado(
      reservaId,
      nuevoEstado
    );

    prisma.auditLog
      .create({
        data: {
          action: "ACTUALIZAR_ESTADO_RESERVA_ADMIN",
          entity: "RESERVA",
          entityId: reservaId,
          userId: adminUser.id,
          details: {
            from: reserva.estado,
            to: nuevoEstado,
          },
        },
      })
      .catch(() => {});

    return updated;
  },
};
