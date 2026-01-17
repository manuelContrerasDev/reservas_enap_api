// src/domains/espacios/contrato/admin/controllers/patch-config.controller.ts
import { Request, Response } from "express";
import { patchEspacioTipoConfigService } from "../services/patch-config.service";

export async function patchEspacioTipoConfigController(req: Request, res: Response) {
  const { tipo } = req.params;
  const data = await patchEspacioTipoConfigService(tipo, req.body);
  res.json({ ok: true, data });
}
