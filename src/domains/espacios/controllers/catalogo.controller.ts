import { Request, Response } from "express";
import { EspaciosService } from "../../domains/espacios/services";
import { catalogoQuerySchema } from "../../validators/espacios";

export const catalogo = async (req: Request, res: Response) => {
  const parsed = catalogoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Query inválida",
      issues: parsed.error.issues,
    });
  }

  try {
    const data = await EspaciosService.catalogo(parsed.data);

    return res.json({ ok: true, data });
  } catch (error) {
    console.error("❌ [ESPACIOS][CATALOGO]", {
      error,
      ip: req.ip,
    });

    return res.status(500).json({
      ok: false,
      error: "Error al obtener espacios",
    });
  }
};
