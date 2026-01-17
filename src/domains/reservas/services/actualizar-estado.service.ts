import { prisma } from "../../../lib/db";
import { ReservaEstado, Role } from "@prisma/client";
import { ReservasAdminRepository } from "../repositories";
import type { AuthUser } from "../../../types/global";

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
  CONFIRMADA: [
    ReservaEstado.CONFIRMADA,
    ReservaEstado.FINALIZADA,
  ],
  RECHAZADA: [ReservaEstado.RECHAZADA],
  CADUCADA: [ReservaEstado.CADUCADA],
  FINALIZADA: [ReservaEstado.FINALIZADA],
};

function isTransitionAllowed(from: ReservaEstado, to: ReservaEstado): boolean {
  return ADMIN_TRANSITIONS[from]?.includes(to) ?? false;
}

export const ActualizarEstadoReservaService = {
  async ejecutar(id: string, nuevoEstado: ReservaEstado, adminUser: AuthUser) {
    if (!adminUser || adminUser.role !== Role.ADMIN) {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    if (!Object.values(ReservaEstado).includes(nuevoEstado)) {
      throw new Error("ESTADO_INVALIDO");
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      select: { id: true, estado: true },
    });
    if (!reserva) throw new Error("NOT_FOUND");

    if (reserva.estado === nuevoEstado) {
      return ReservasAdminRepository.obtenerPorId(id);
    }

    if (!isTransitionAllowed(reserva.estado, nuevoEstado)) {
      throw new Error("TRANSICION_INVALIDA");
    }

    const updated = await ReservasAdminRepository.actualizarEstado(
      id,
      nuevoEstado
    );

    prisma.auditLog.create({
      data: {
        action: "ACTUALIZAR_ESTADO_RESERVA_ADMIN",
        entity: "RESERVA",
        entityId: id,
        userId: adminUser.id,
        details: {
          from: reserva.estado,
          to: nuevoEstado,
        },
      },
    }).catch(() => {});

    return updated;
  },
};
