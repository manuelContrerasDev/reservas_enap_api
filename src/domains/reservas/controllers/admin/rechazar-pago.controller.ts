import { Response } from "express";
import type { AuthRequest } from "@/types/global";

import { rechazarPagoSchema } from "@/domains/reservas/validators";
import { RechazarPagoAdminService } from "@/domains/reservas/services";
import { reservaToDTO } from "@/domains/reservas/mappers/reservaToDTO";

/**
 * ❌ RECHAZAR PAGO (ADMIN)
 * PATCH /api/reservas/admin/:id/rechazar
 */
export const rechazarPagoAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const { motivo } = rechazarPagoSchema.parse(req.body);

    const reserva = await RechazarPagoAdminService.ejecutar(
      req.params.id,
      req.user,
      motivo
    );

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    const message = error?.message ?? "ERROR_RECHAZAR_PAGO";

    const statusMap: Record<string, number> = {
      NO_AUTH: 401,
      NO_AUTORIZADO_ADMIN: 403,
      NOT_FOUND: 404,
      TRANSICION_INVALIDA: 409,
      MOTIVO_REQUERIDO: 400,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
