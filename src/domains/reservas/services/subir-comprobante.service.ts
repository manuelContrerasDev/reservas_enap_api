import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../../types/global";
import type { SubirComprobanteType } from "../validators/subir-comprobante.schema";
import { createAuditLogService } from "@/domains/audit/services/audit-log.service";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export const SubirComprobanteService = {
  async ejecutar(reservaId: string, data: SubirComprobanteType, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    const estadosBloqueados: ReservaEstado[] = [
      ReservaEstado.CANCELADA,
      ReservaEstado.RECHAZADA,
      ReservaEstado.CADUCADA,
    ];

    if (estadosBloqueados.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_ADMITE_COMPROBANTE");
    }

    const updated = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        comprobanteUrl: data.comprobanteUrl,
        comprobanteName: data.comprobanteName,
        comprobanteMime: data.comprobanteMime,
        comprobanteSize: data.comprobanteSize,
      },
    });

    await createAuditLogService({
      action: AUDIT_ACTIONS.SUBIR_COMPROBANTE,
      entity: "RESERVA",
      entityId: reservaId,
      actor: user,
      before: { comprobanteUrl: reserva.comprobanteUrl },
      after: { comprobanteUrl: updated.comprobanteUrl },
    });

    return updated;
  },
};
