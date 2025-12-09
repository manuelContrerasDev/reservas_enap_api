import { Request, Response } from "express";
import { EspaciosService } from "../../services/espacios";
import { crearEspacioSchema } from "../../validators/espacios";

export const crear = async (req: Request, res: Response) => {
  try {
    const body = crearEspacioSchema.parse(req.body);

    const espacio = await EspaciosService.crear(body);

    return res.status(201).json({
      ok: true,
      message: "Espacio creado correctamente",
      data: espacio,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "Datos inválidos", issues: error.issues });
    }

    console.error("❌ [crear] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al crear espacio" });
  }
};
