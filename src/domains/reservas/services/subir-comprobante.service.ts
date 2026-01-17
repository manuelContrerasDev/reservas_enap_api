// ============================================================
// src/domains/reservas/services/subir-comprobante.service.ts
// ENAP 2026 — Sync con contrato Reservas
// ============================================================

import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../../types/global";
import type { SubirComprobanteType } from "../validators/subir-comprobante.schema";
import { createAuditLogService } from "@/domains/audit/services/audit-log.service";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export const SubirComprobanteService = {
  async ejecutar(reservaId: string, data: SubirComprobanteType, user: AuthUser) {
    if (!user?.id) throw new Error("NO_AUTH");

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: {
        id: true,
        estado: true,
        userId: true,
        comprobanteUrl: true,
      },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    // 🔐 Permisos
    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    // 🚫 Estados que NO admiten comprobante
    if (
      reserva.estado === ReservaEstado.RECHAZADA ||
      reserva.estado === ReservaEstado.CADUCADA ||
      reserva.estado === ReservaEstado.CONFIRMADA ||
      reserva.estado === ReservaEstado.FINALIZADA
    ) {
      throw new Error("RESERVA_NO_ADMITE_COMPROBANTE");
    }

    // ✅ Solo se puede subir desde PENDIENTE_PAGO
    if (reserva.estado !== ReservaEstado.PENDIENTE_PAGO) {
      throw new Error("ESTADO_INVALIDO_PARA_COMPROBANTE");
    }

    const updated = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        comprobanteUrl: data.comprobanteUrl,
        comprobanteName: data.comprobanteName,
        comprobanteMime: data.comprobanteMime,
        comprobanteSize: data.comprobanteSize,

        // 🔁 Transición contractual
        estado: ReservaEstado.PENDIENTE_VALIDACION,
      },
    });

    await createAuditLogService({
      action: AUDIT_ACTIONS.SUBIR_COMPROBANTE,
      entity: "RESERVA",
      entityId: reservaId,
      actor: user,
      before: {
        estado: reserva.estado,
        comprobanteUrl: reserva.comprobanteUrl,
      },
      after: {
        estado: ReservaEstado.PENDIENTE_VALIDACION,
        comprobanteUrl: updated.comprobanteUrl,
      },
    });

    return updated;
  },
};
