// src/domains/espacios/contrato/controllers/catalogo.controller.ts
import type { Request, Response } from "express";
import { catalogoContratoQuerySchema } from "../validators/catalogo-query.schema";
import { catalogoContratoService } from "../services/catalogo.service";

export async function catalogoContratoController(req: Request, res: Response) {
  const parsed = catalogoContratoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "QUERY_INVALIDA", issues: parsed.error.issues });
  }

  // auth opcional: si no hay user, es público => EXTERNO
  const actorRole = (req as any).user?.role ?? null;

  const data = await catalogoContratoService({
    actorRole,
    usoReserva: parsed.data.usoReserva ?? null,
  });

  return res.json({ ok: true, data });
}
