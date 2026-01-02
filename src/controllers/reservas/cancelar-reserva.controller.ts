// ============================================================
// cancelar.controller.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { CancelarReservaService } from "../../services/reservas/cancelar-reserva.service";

export const cancelarReserva = async (req: AuthRequest, res: Response) => {
  try {
    /* --------------------------------------------------------
     * 🔐 Auth garantizada por authGuard
     * -------------------------------------------------------- */
    const user = req.user;
    if (!user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const reservaId = req.params.id;

    const reserva = await CancelarReservaService.ejecutar(reservaId, user);

    return res.json({
      ok: true,
      message: "Reserva cancelada correctamente",
      data: reserva,
    });

  } catch (error: any) {
    const message = error?.message ?? "ERROR_CANCELAR_RESERVA";

    console.error("❌ [cancelar reserva]:", message);

    /* --------------------------------------------------------
     * 🎯 Mapeo errores dominio → HTTP
     * -------------------------------------------------------- */
    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      NO_PERMITIDO: 403,
      RESERVA_NO_CANCELABLE: 409,
      RESERVA_CONFIRMADA_NO_CANCELABLE: 409,
      NO_PERMITIDO_TIEMPO: 409,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
