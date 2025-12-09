// src/controllers/reservas/mias.controller.ts

import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ReservasMiasService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const mias = async (req: AuthRequest, res: Response) => {
  try {
    const reservas = await ReservasMiasService.ejecutar(req.user);

    return res.json({
      ok: true,
      reservas: reservas.map(reservaToDTO),
    });

  } catch (error: any) {
    console.error("❌ [mias reservas]:", error);

    return res
      .status(400)
      .json({ ok: false, error: error.message ?? "Error al obtener reservas" });
  }
};
