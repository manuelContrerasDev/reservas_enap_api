// src/controllers/reservas/obtener.controller.ts

import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ObtenerReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const obtener = async (req: AuthRequest, res: Response) => {
  try {
    const reserva = await ObtenerReservaService.ejecutar(req.params.id);

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {
    console.error("❌ [obtener reserva]:", error);

    const status = error.message === "NOT_FOUND" ? 404 : 500;
    return res.status(status).json({ ok: false, error: error.message });
  }
};
