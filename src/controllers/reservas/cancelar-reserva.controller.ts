// src/controllers/reservas/cancelar.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { CancelarReservaService } from "../../services/reservas/cancelar-reserva.service";

export const cancelarReserva = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const reservaId = req.params.id;

    const reserva = await CancelarReservaService.ejecutar(reservaId, req.user);

    return res.json({
      ok: true,
      message: "Reserva cancelada correctamente",
      data: reserva,
    });

  } catch (error: any) {
    console.error("❌ [cancelar reserva]:", error.message);

    const status =
      error.message === "NOT_FOUND"
        ? 404
        : error.message === "NO_PERMITIDO"
        ? 403
        : error.message === "RESERVA_NO_CANCELABLE"
        ? 409
        : error.message === "RESERVA_CONFIRMADA_NO_CANCELABLE"
        ? 409
        : error.message === "NO_PERMITIDO_TIEMPO"
        ? 409
        : 500;

    return res.status(status).json({
      ok: false,
      error: error.message || "Error al cancelar reserva",
    });
  }
};
