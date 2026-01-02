// ============================================================
// eliminar-reserva.service.ts — ENAP 2025 (ADMIN SOFT DELETE)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, Role } from "@prisma/client";
import type { AuthUser } from "../../types/global";

export const EliminarReservaService = {
  async ejecutar(reservaId: string, admin: AuthUser) {
    /* --------------------------------------------------------
     * 0) Seguridad
     * -------------------------------------------------------- */
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    /* --------------------------------------------------------
     * 1) Obtener reserva
     * -------------------------------------------------------- */
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: {
        id: true,
        estado: true,
      },
    });

    if (!reserva) {
      throw new Error("NOT_FOUND");
    }

    /* --------------------------------------------------------
     * 2) Estados NO anulables
     * -------------------------------------------------------- */
    const estadosBloqueados: ReservaEstado[] = [
      ReservaEstado.CONFIRMADA,
      ReservaEstado.FINALIZADA,
      ReservaEstado.CADUCADA,
    ];

    if (estadosBloqueados.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_ELIMINABLE");
    }

    /* --------------------------------------------------------
     * 3) Anulación administrativa (soft delete)
     * -------------------------------------------------------- */
    await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        estado: ReservaEstado.CANCELADA,
        cancelledAt: new Date(),
        cancelledBy: "ADMIN",
      },
    });

    /* --------------------------------------------------------
     * 4) AuditLog (NO bloqueante)
     * -------------------------------------------------------- */
    prisma.auditLog
      .create({
        data: {
          action: "ADMIN_ANULAR_RESERVA",
          entity: "Reserva",
          entityId: reservaId,
          userId: admin.id,
          details: {
            estadoAnterior: reserva.estado,
            nuevoEstado: ReservaEstado.CANCELADA,
          },
        },
      })
      .catch(() => {});

    return true;
  },
};
