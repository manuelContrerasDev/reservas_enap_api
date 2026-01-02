// ============================================================
// actualizar-estado.service.ts — ENAP 2025 (PRODUCTION READY)
// Matriz de transición oficial + sin conflictos TS
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";
import { ReservasAdminRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";

/* ============================================================
 * Transiciones permitidas por ADMIN
 * ============================================================ */
const ADMIN_TRANSITIONS: Record<ReservaEstado, readonly ReservaEstado[]> = {
  PENDIENTE_PAGO: [
    "PENDIENTE_PAGO",
    "CONFIRMADA",
    "RECHAZADA",
    "CANCELADA",
    "CADUCADA",
  ],
  CONFIRMADA: ["CONFIRMADA", "FINALIZADA", "CANCELADA"],
  RECHAZADA: ["RECHAZADA", "PENDIENTE_PAGO"],
  CANCELADA: ["CANCELADA"],
  CADUCADA: ["CADUCADA"],
  FINALIZADA: ["FINALIZADA"],
};

function isTransitionAllowed(
  from: ReservaEstado,
  to: ReservaEstado
): boolean {
  return ADMIN_TRANSITIONS[from]?.includes(to) ?? false;
}

export const ActualizarEstadoReservaService = {
  async ejecutar(id: string, nuevoEstado: ReservaEstado, adminUser: AuthUser) {
    // 0) ADMIN only
    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    // 1) Validación de entrada
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

    // 3) Validar transición
    if (!isTransitionAllowed(estadoActual, nuevoEstado)) {
      throw new Error("TRANSICION_INVALIDA");
    }

    // 4) Persistir con repository
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
