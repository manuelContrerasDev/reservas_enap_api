// ============================================================
// actualizar-estado.controller.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ActualizarEstadoReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";
import { actualizarEstadoSchema } from "../../validators/reservas";

export const actualizarEstado = async (req: AuthRequest, res: Response) => {
  try {
    // 🔐 Auth + ADMIN garantizados por router
    const admin = req.user!;
    const reservaId = req.params.id;

    const payload = actualizarEstadoSchema.parse(req.body);

    const reserva = await ActualizarEstadoReservaService.ejecutar(
      reservaId,
      payload.estado,
      admin
    );

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {
    const message = error?.message ?? "ERROR_ACTUALIZAR_ESTADO";

    console.error("❌ [actualizar estado reserva]:", message);

    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      NO_AUTORIZADO_ADMIN: 403,
      ESTADO_REQUERIDO: 400,
      ESTADO_INVALIDO: 400,
      TRANSICION_INVALIDA: 409,
      RESERVA_FINALIZADA_NO_MODIFICABLE: 409,
      RESERVA_CANCELADA_NO_MODIFICABLE: 409,
      RESERVA_RECHAZADA_SOLO_PUEDE_IR_A_PENDIENTE: 409,
      CONFIRMADA_SOLO_PUEDE_FINALIZARSE: 409,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
