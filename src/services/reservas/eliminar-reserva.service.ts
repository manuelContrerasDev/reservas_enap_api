// src/services/reservas/eliminar-reserva.service.ts
// ============================================================
// EliminarReservaService — ENAP 2025 (ADMIN ONLY, FINAL)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, Role } from "@prisma/client";

interface AuthUser {
  id: string;
  role: Role;
}

export const EliminarReservaService = {
  async ejecutar(reservaId: string, admin: AuthUser) {
    // --------------------------------------------------------
    // 1) Validar rol administrador
    // --------------------------------------------------------
    if (!admin || admin.role !== "ADMIN") {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    // --------------------------------------------------------
    // 2) Obtener reserva
    // --------------------------------------------------------
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: {
        id: true,
        estado: true,
        fechaInicio: true,
      },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    // --------------------------------------------------------
    // 3) Reglas contables ENAP 2025
    //    FINALIZADA → No puede eliminarse
    //    CADUCADA  → No eliminar (historial)
    // --------------------------------------------------------
    const estadosBloqueados: ReservaEstado[] = [
      ReservaEstado.FINALIZADA,
      ReservaEstado.CADUCADA,
    ];

    if (estadosBloqueados.includes(reserva.estado)) {
      throw new Error("NO_PERMITIDO");
    }

    // --------------------------------------------------------
    // 4) Transacción de eliminación total
    // --------------------------------------------------------
    await prisma.$transaction([
      prisma.invitado.deleteMany({ where: { reservaId } }),
      prisma.pago.deleteMany({ where: { reservaId } }),
      prisma.reserva.delete({ where: { id: reservaId } }),
    ]);

    // --------------------------------------------------------
    // 5) AuditLog (no bloquea el flujo si falla)
    // --------------------------------------------------------
    prisma.auditLog
      .create({
        data: {
          action: "ADMIN_ELIMINAR_RESERVA",
          entity: "Reserva",
          entityId: reservaId,
          userId: admin.id,
          details: {
            estadoAnterior: reserva.estado,
          },
        },
      })
      .catch(() => {});

    return true;
  },
};
