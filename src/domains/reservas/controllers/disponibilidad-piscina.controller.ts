// src/controllers/reservas/disponibilidad-piscina.controller.ts

import { Response } from "express";
import type { Request } from "express";
import { piscinaFechaSchema } from "../validators";
import { DisponibilidadPiscinaService } from "../services";

export const disponibilidadPiscina = async (req: Request, res: Response) => {
  const { fecha } = piscinaFechaSchema.parse(req.query);

  const data = await DisponibilidadPiscinaService.ejecutar(fecha);

  return res.json({ ok: true, data });
};
