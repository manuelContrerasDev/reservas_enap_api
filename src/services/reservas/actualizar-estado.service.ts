// ============================================================
// actualizar-estado.service.ts — ENAP 2025 (VERSIÓN OFICIAL)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, User } from "@prisma/client";
import { ReservasAdminRepository } from "../../repositories/reservas";

export const ActualizarEstadoReservaService = {
  async ejecutar(id: string, nuevoEstado: ReservaEstado, adminUser: User) {
    // --------------------------------------------------------
    // 0) Validación ADMIN (defensa extra)
    // --------------------------------------------------------
    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    // --------------------------------------------------------
    // 1) Validar estado entrante
    // --------------------------------------------------------
    if (!nuevoEstado) throw new Error("ESTADO_REQUERIDO");

    if (!Object.values(ReservaEstado).includes(nuevoEstado)) {
      throw new Error("ESTADO_INVALIDO");
    }

    // --------------------------------------------------------
    // 2) Obtener reserva actual
    // --------------------------------------------------------
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      select: { id: true, estado: true },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    const estadoActual = reserva.estado;

    // --------------------------------------------------------
    // 3) Reglas de transición ENAP 2025
    // --------------------------------------------------------

    // 3.1 FINALIZADA nunca puede cambiar
    if (estadoActual === "FINALIZADA") {
      throw new Error("RESERVA_FINALIZADA_NO_MODIFICABLE");
    }

    // 3.2 CANCELADA solo puede seguir CANCELADA
    if (estadoActual === "CANCELADA" && nuevoEstado !== "CANCELADA") {
      throw new Error("RESERVA_CANCELADA_NO_MODIFICABLE");
    }

    // 3.3 RECHAZADA → solo puede pasar a PENDIENTE_PAGO
    if (estadoActual === "RECHAZADA") {
      if (nuevoEstado !== "PENDIENTE_PAGO") {
        throw new Error("RESERVA_RECHAZADA_SOLO_PUEDE_IR_A_PENDIENTE");
      }
    }

    // 3.4 CONFIRMADA → solo puede pasar a FINALIZADA
    if (estadoActual === "CONFIRMADA") {
      if (nuevoEstado !== "FINALIZADA") {
        throw new Error("CONFIRMADA_SOLO_PUEDE_FINALIZARSE");
      }
    }

    // 3.5 PENDIENTE & PENDIENTE_PAGO (legacy)
    if (estadoActual === "PENDIENTE_PAGO" || estadoActual === "PENDIENTE") {
      const permitidos = [
        "CONFIRMADA",
        "CANCELADA",
        "RECHAZADA",
        "PENDIENTE_PAGO",
      ];

      if (!permitidos.includes(nuevoEstado)) {
        throw new Error("TRANSICION_INVALIDA");
      }
    }

    // --------------------------------------------------------
    // 4) Actualizar estado
    // --------------------------------------------------------
    const reservaActualizada = await ReservasAdminRepository.actualizarEstado(
      id,
      nuevoEstado
    );

    // --------------------------------------------------------
    // 5) AuditLog
    // --------------------------------------------------------
    await prisma.auditLog.create({
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
    }).catch(() => {});

    return reservaActualizada;
  },
};
