// src/controllers/reservas/actualizar-estado.controller.ts

import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ActualizarEstadoReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const actualizarEstado = async (req: AuthRequest, res: Response) => {
  try {
    const reserva = await ActualizarEstadoReservaService.ejecutar(
      req.params.id,
      req.body.estado
    );

    return res.json({
      ok: true,
      reserva: reservaToDTO(reserva),
    });

  } catch (error: any) {
    console.error("❌ [actualizar estado reserva]:", error);

    return res
      .status(400)
      .json({ ok: false, error: error.message ?? "Error al actualizar estado" });
  }
};
