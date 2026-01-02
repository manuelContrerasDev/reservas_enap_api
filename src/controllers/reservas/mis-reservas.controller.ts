import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ReservasMiasService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const misReservas = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("NO_AUTH");

    const reservas = await ReservasMiasService.ejecutar(req.user);

    return res.json({
      ok: true,
      data: reservas.map(reservaToDTO),
    });

  } catch (error: any) {
    const message = error?.message ?? "ERROR_MIS_RESERVAS";

    console.error("❌ [mis reservas]:", message);

    return res.status(message === "NO_AUTH" ? 401 : 500).json({
      ok: false,
      error: message,
    });
  }
};

