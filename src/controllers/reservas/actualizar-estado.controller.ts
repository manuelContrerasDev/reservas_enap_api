import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ActualizarEstadoReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";
import { actualizarEstadoSchema } from "../../validators/reservas";

export const actualizarEstado = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "NO_AUTORIZADO_ADMIN" });
    }

    const payload = actualizarEstadoSchema.parse(req.body);

    const reserva = await ActualizarEstadoReservaService.ejecutar(
      req.params.id,
      payload.estado
    );

    return res.json({ ok: true, data: reservaToDTO(reserva) });

  } catch (error: any) {
    console.error("❌ [actualizar estado reserva]:", error);

    const status = error.message === "NOT_FOUND" ? 404 : 400;

    return res.status(status).json({
      ok: false,
      error: error.message ?? "Error al actualizar estado",
    });
  }
};
