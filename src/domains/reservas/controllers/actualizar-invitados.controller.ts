// src/controllers/reservas/actualizar-invitados.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../../types/global";

import { actualizarInvitadosSchema } from "../validators";
import { ActualizarInvitadosReservaService } from "../services/actualizar-invitados.service";
import { reservaToDTO } from "../utils/reservaToDTO";

export const actualizarInvitados = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("NO_AUTH");

    const payload = actualizarInvitadosSchema.parse(req.body);

    const reserva = await ActualizarInvitadosReservaService.ejecutar(
      req.params.id,
      payload,
      req.user
    );

    return res.json({
      ok: true,
      message: "Invitados actualizados correctamente",
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    const message = error?.message ?? "ERROR_ACTUALIZAR_INVITADOS";
    console.error("❌ [actualizar invitados]:", message);

    const statusMap: Record<string, number> = {
      NO_AUTH: 401,
      NOT_FOUND: 404,
      NO_PERMITIDO: 403,

      RESERVA_NO_MODIFICABLE: 409,
      NO_PERMITIDO_TIEMPO: 409,
      FUERA_DE_VENTANA_EDICION: 409,

      INVITADOS_INVALIDOS: 422,
      INVITADO_DATOS_INVALIDOS: 422,
      EDAD_INVITADO_INVALIDA: 422,
      CANTIDAD_ADULTOS_SUPERADA: 409,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
