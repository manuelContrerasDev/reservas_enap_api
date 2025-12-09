import { Request, Response } from "express";
import { EspaciosService } from "../../services/espacios";
import { catalogoQuerySchema } from "../../validators/espacios";

export const catalogo = async (req: Request, res: Response) => {
  try {
    const validatedQuery = catalogoQuerySchema.parse(req.query);

    const data = await EspaciosService.catalogo(validatedQuery);

    return res.json({ ok: true, data });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "Query inválida", issues: error.issues });
    }

    console.error("❌ [catalogo] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al obtener espacios" });
  }
};
