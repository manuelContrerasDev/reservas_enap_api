import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { ZodError } from "zod";

import { ActualizarEstadoReservaService } from "../services";
import { reservaToDTO } from "../mappers/reservaToDTO";
import { actualizarEstadoSchema } from "../validators";

export const actualizarEstado = async (req: AuthRequest, res: Response) => {
  try {
    // 🔐 auth + rol ADMIN garantizados por router (roleGuard), pero igual defensivo
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const reservaId = req.params.id;

    // Nota: si ya usas validate(actualizarEstadoSchema) en router,
    // esto podría omitirse. Lo dejamos para “verdad absoluta”.
    const payload = actualizarEstadoSchema.parse(req.body);

    const reserva = await ActualizarEstadoReservaService.ejecutar(
      reservaId,
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

      ESTADO_REQUERIDO: 400,
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
