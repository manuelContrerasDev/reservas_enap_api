// ============================================================
// cancelar-reserva-admin.service.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../types/global";

export const CancelarReservaAdminService = {
  async ejecutar(reservaId: string, admin: AuthUser, motivo?: string) {
    // ✅ errores con códigos claros
    if (!admin?.id) throw new Error("NO_AUTH");
    if (admin.role !== "ADMIN") throw new Error("NO_AUTORIZADO_ADMIN");

    // Defensa mínima (igual pasa por validateParams, pero dejamos blindado)
    if (!reservaId || reservaId.trim().length < 10) {
      throw new Error("INVALID_ID");
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, estado: true },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    // 🔒 Política actual: admin SOLO cancela PENDIENTE_PAGO
    if (reserva.estado !== ReservaEstado.PENDIENTE_PAGO) {
      throw new Error("RESERVA_NO_CANCELABLE");
    }

    const updated = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        estado: ReservaEstado.CANCELADA,
        cancelledAt: new Date(),
        cancelledBy: "ADMIN",
      },
    });

    // AuditLog no bloqueante
    prisma.auditLog
      .create({
        data: {
          action: "CANCELAR_RESERVA_ADMIN",
          entity: "Reserva",
          entityId: reservaId,
          userId: admin.id,
          details: {
            estadoAnterior: reserva.estado,
            nuevoEstado: "CANCELADA",
            motivo: motivo?.trim() || null,
          },
        },
      })
      .catch(() => {});

    return updated;
  },
};
