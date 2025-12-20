// ============================================================
// cancelar-reserva.service.ts — ENAP 2025 (VERSIÓN FINAL)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, User } from "@prisma/client";

// El AuthUser viene desde el JWT → id, email, role, name
interface AuthUser {
  id: string;
  email: string;
  role: "SOCIO" | "EXTERNO" | "ADMIN";
  name?: string;
}

export const CancelarReservaService = {
  async ejecutar(reservaId: string, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");

    // --------------------------------------------------------
    // 1) Obtener reserva (ligero)
    // --------------------------------------------------------
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: {
        id: true,
        userId: true,
        estado: true,
        fechaInicio: true,
      },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    // --------------------------------------------------------
    // 2) Usuario solo puede cancelar SU PROPIA reserva
    // --------------------------------------------------------
    if (reserva.userId !== user.id) {
      throw new Error("NO_PERMITIDO");
    }

    // --------------------------------------------------------
    // 3) Estados NO cancelables por usuario
    // --------------------------------------------------------
    const estadosNoCancelables: ReservaEstado[] = [
      ReservaEstado.CANCELADA,
      ReservaEstado.FINALIZADA,
      ReservaEstado.RECHAZADA,
      ReservaEstado.CADUCADA,
    ];

    if (estadosNoCancelables.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_CANCELABLE");
    }

    // Usuario NO puede cancelar una reserva CONFIRMADA (ya pagada)
    if (reserva.estado === ReservaEstado.CONFIRMADA) {
      throw new Error("RESERVA_CONFIRMADA_NO_CANCELABLE");
    }

    // --------------------------------------------------------
    // 4) No cancelar el mismo día del inicio
    // --------------------------------------------------------
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicio = new Date(reserva.fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (hoy >= inicio) {
      throw new Error("NO_PERMITIDO_TIEMPO");
    }

    // --------------------------------------------------------
    // 5) Actualizar estado a CANCELADA
    // --------------------------------------------------------
    const reservaActualizada = await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado: ReservaEstado.CANCELADA },
    });

    // --------------------------------------------------------
    // 6) Audit log (no romper si falla)
    // --------------------------------------------------------
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
          },
        },
      })
      .catch(() => {});

    return reservaActualizada;
  },
};
