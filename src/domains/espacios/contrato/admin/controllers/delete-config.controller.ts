// src/domains/espacios/contrato/admin/controllers/delete-config.controller.ts
import { Request, Response } from "express";
import { deleteEspacioTipoConfigService } from "../services/delete-config.service";

export async function deleteEspacioTipoConfigController(req: Request, res: Response) {
  const { tipo } = req.params;
  await deleteEspacioTipoConfigService(tipo);
  res.json({ ok: true });
}
