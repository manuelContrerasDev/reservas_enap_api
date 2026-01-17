// src/domains/espacios/contrato/admin/controllers/seed-config.controller.ts
import { Request, Response } from "express";
import { seedEspacioTipoConfigService } from "../services/seed-config.service";

export async function seedEspacioTipoConfigController(req: Request, res: Response) {
  const data = await seedEspacioTipoConfigService(req.body);
  res.json({ ok: true, data });
}
