// src/controllers/reservas/cancelar.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { CancelarReservaService } from "../services/cancelar-reserva.service";
import { reservaToDTO } from "../utils/reservaToDTO";

export const cancelarReserva = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ ok: false, error: "NO_AUTH" });

    const reservaId = req.params.id;
    const motivo = req.body?.motivo ? String(req.body.motivo) : undefined;

    const reserva = await CancelarReservaService.ejecutar(reservaId, user, motivo);

    return res.json({
      ok: true,
      message: "Reserva cancelada correctamente",
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    const message = error?.message ?? "ERROR_CANCELAR_RESERVA";
    console.error("❌ [cancelar reserva user]:", message);

    const statusMap: Record<string, number> = {
      NO_AUTH: 401,
      INVALID_ID: 400,
      NOT_FOUND: 404,
      NO_PERMITIDO: 403,

      RESERVA_NO_CANCELABLE: 409,
      NO_PERMITIDO_TIEMPO: 409,
      RESERVA_CADUCADA: 409,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
