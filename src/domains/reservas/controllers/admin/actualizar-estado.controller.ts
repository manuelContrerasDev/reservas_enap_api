import { Response } from "express";
import { ZodError } from "zod";
import type { AuthRequest } from "@/types/global";

import { ActualizarEstadoAdminService } from "@/domains/reservas/services";
import { reservaToDTO } from "@/domains/reservas/mappers/reservaToDTO";
import { actualizarEstadoReservaSchema } from "@/domains/reservas/validators";

export const actualizarEstadoAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const payload = actualizarEstadoReservaSchema.parse(req.body);

    const reserva = await ActualizarEstadoAdminService.ejecutar(
      req.params.id,
      payload.estado,
      req.user
    );

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        error: "VALIDATION_ERROR",
        issues: error.issues,
      });
    }

    const message = error?.message ?? "ERROR_ACTUALIZAR_ESTADO";

    const statusMap: Record<string, number> = {
      NO_AUTH: 401,
      NO_AUTORIZADO_ADMIN: 403,
      ESTADO_INVALIDO: 400,
      NOT_FOUND: 404,
      TRANSICION_INVALIDA: 409,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
