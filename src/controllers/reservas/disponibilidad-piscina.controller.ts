// src/controllers/reservas/disponibilidad-piscina.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { piscinaFechaSchema } from "../../validators/reservas";
import { DisponibilidadPiscinaService } from "../../services/reservas";

export const disponibilidadPiscina = async (req: AuthRequest, res: Response) => {
  try {
    const { fecha } = piscinaFechaSchema.parse({
      fecha: req.query.fecha,
    });

    const data = await DisponibilidadPiscinaService.ejecutar(fecha);

    return res.json({ ok: true, data });

  } catch (error: any) {
    console.error("❌ [disponibilidad piscina]:", error);

    const status =
      error.message === "FECHA_REQUERIDA" ||
      error.message === "FECHA_INVALIDA"
        ? 400
        : 500;

    return res.status(status).json({
      ok: false,
      error: error.message ?? "Error al obtener disponibilidad",
    });
  }
};
