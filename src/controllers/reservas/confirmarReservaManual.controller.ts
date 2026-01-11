// src/controllers/reservas/confirmarReservaManual.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { ConfirmarReservaManualService } from "../../services/reservas/confirmar-reserva-manual.service";
import { reservaToDTO } from "./utils/reservaToDTO";

export const confirmarReservaManual = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const reserva = await ConfirmarReservaManualService.ejecutar(
      req.params.id,
      req.user
    );

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    const map: Record<string, number> = {
      NO_AUTORIZADO_ADMIN: 403,
      NOT_FOUND: 404,
      TRANSICION_INVALIDA: 409,
      COMPROBANTE_REQUERIDO: 409,
    };

    return res.status(map[error.message] ?? 500).json({
      ok: false,
      error: error.message,
    });
  }
};
