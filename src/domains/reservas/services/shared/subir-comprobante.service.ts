import { prisma } from "@/lib/db";
import { ReservaEstado, Role } from "@prisma/client";
import type { AuthUser } from "@/types/global";

import type { SubirComprobanteType } from "@/domains/reservas/validators";
import { createAuditLogService } from "@/domains/audit/services/audit-log.service";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export const SubirComprobanteService = {
  async ejecutar(
    reservaId: string,
    data: SubirComprobanteType,
    user: AuthUser
  ) {
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
    if (user.role !== Role.ADMIN && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    // 🚫 Estados inválidos
    const ESTADOS_NO_ADMITEN_COMPROBANTE: readonly ReservaEstado[] = [
      ReservaEstado.RECHAZADA,
      ReservaEstado.CADUCADA,
      ReservaEstado.CONFIRMADA,
      ReservaEstado.FINALIZADA,
    ];

    if (ESTADOS_NO_ADMITEN_COMPROBANTE.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_ADMITE_COMPROBANTE");
    }


    // ✅ Solo desde PENDIENTE_PAGO
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

        estado: ReservaEstado.PENDIENTE_VALIDACION,
        expiresAt: null, // 🔒 contrato
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
