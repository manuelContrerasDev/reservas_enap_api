// src/controllers/reservas/eliminar.controller.ts

import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { EliminarReservaService } from "../../services/reservas";

export const eliminar = async (req: AuthRequest, res: Response) => {
  try {
    await EliminarReservaService.ejecutar(req.params.id);

    return res.json({
      ok: true,
      message: "Reserva eliminada correctamente",
    });

  } catch (error: any) {
    console.error("❌ [eliminar reserva]:", error);

    return res
      .status(error.message === "NOT_FOUND" ? 404 : 500)
      .json({ ok: false, error: error.message });
  }
};
