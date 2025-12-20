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

    const reserva = await ObtenerReservaService.ejecutar(
      req.params.id,
      req.user
    );

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {
    console.error("❌ [obtener reserva]:", error);

    const message = error.message ?? "Error al obtener reserva";

    const status =
      message === "NO_AUTH" ? 401 :
      message === "NOT_FOUND" ? 404 :
      message === "FORBIDDEN" ? 403 :
      500;

    return res.status(status).json({
      ok: false,
      error: message,
    });
  }
};
