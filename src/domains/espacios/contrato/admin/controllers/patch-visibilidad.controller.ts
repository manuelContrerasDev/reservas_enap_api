// src/domains/espacios/contrato/admin/controllers/patch-visibilidad.controller.ts
import { Request, Response } from "express";
import { visibilidadSchema } from "../validators/visibilidad.schema";
import { patchVisibilidadService } from "../services/patch-visibilidad.service";

export async function patchVisibilidadController(req: Request, res: Response) {
  const parsed = visibilidadSchema.parse(req.body);
  const { tipo } = req.params;

  const data = await patchVisibilidadService(tipo, parsed.visible);
  res.json({ ok: true, data });
}
