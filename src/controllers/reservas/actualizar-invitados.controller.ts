// src/controllers/reservas/actualizar-invitados.controller.ts

import { Response } from "express";
import { ActualizarInvitadosReservaService } from "../../services/reservas/actualizar-invitados.service";
import type { AuthRequest } from "../../types/global";

export const actualizarInvitados = async (req: AuthRequest, res: Response) => {
  try {
    const reservaId = req.params.id;

    const reservaActualizada = await ActualizarInvitadosReservaService.ejecutar(
      reservaId,
      req.body,
      req.user
    );

    return res.json({
      ok: true,
      message: "Invitados actualizados correctamente",
      data: reservaActualizada,
    });

  } catch (error: any) {
    console.error("❌ [actualizar invitados]:", error.message);

    const map: Record<string, number> = {
      NO_AUTH: 401,
      NOT_FOUND: 404,
      NO_PERMITIDO: 403,
      NO_PERMITIDO_TIEMPO: 400,
      INVITADOS_INVALIDOS: 400,
      CANTIDAD_INCORRECTA: 400,
    };

    const status = map[error.message] ?? 500;

    return res.status(status).json({
      ok: false,
      error: error.message || "Error al actualizar invitados",
    });
  }
};
