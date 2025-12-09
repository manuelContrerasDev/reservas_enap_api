// src/controllers/reservas/crear.controller.ts

import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { CrearReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const crear = async (req: AuthRequest, res: Response) => {
  try {
    const reserva = await CrearReservaService.ejecutar(req.body, req.user);

    return res.status(201).json({
      ok: true,
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {
    console.error("❌ [crear reserva]:", error);

    return res
      .status(400)
      .json({ ok: false, error: error.message ?? "Error al crear reserva" });
  }
};
