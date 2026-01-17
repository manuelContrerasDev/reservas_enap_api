// src/domains/espacios/contrato/controllers/detalle.controller.ts
import type { Request, Response } from "express";
import { TipoEspacio } from "@prisma/client";
import { detalleContratoQuerySchema } from "../validators/detalle-query.schema";
import { detalleContratoService } from "../services/detalle.service";

export async function detalleContratoController(req: Request, res: Response) {
  const tipo = req.params.tipo as TipoEspacio;

  const parsed = detalleContratoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "QUERY_INVALIDA", issues: parsed.error.issues });
  }

  const data = await detalleContratoService({
    tipo,
    desdeISO: parsed.data.desde,
    hastaISO: parsed.data.hasta,
  });

  return res.json({ ok: true, data });
}
