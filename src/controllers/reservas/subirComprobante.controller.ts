// src/controllers/reservas/subirComprobante.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { subirComprobanteSchema } from "../../validators/reservas/subir-comprobante.schema";
import { SubirComprobanteService } from "../../services/reservas/subir-comprobante.service";
import { reservaToDTO } from "./utils/reservaToDTO";

export const subirComprobante = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const payload = subirComprobanteSchema.parse(req.body);

    const reserva = await SubirComprobanteService.ejecutar(
      req.params.id,
      payload,
      req.user
    );

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      error: error.message ?? "ERROR_SUBIR_COMPROBANTE",
    });
  }
};
