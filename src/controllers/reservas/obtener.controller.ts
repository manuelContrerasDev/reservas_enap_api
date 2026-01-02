// src/controllers/reservas/obtener.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ObtenerReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const obtener = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: "NO_AUTH",
      });
    }

    const reservaId = req.params.id;

    const reserva = await ObtenerReservaService.ejecutar(reservaId, req.user);

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {
    const message = error?.message ?? "ERROR_OBTENER_RESERVA";

    console.error("❌ [obtener reserva]:", message);

    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      NO_AUTH: 401,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
