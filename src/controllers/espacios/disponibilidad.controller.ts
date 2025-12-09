import { Request, Response } from "express";
import { EspaciosService } from "../../services/espacios";
import { espacioIdSchema } from "../../validators/espacios";

export const disponibilidad = async (req: Request, res: Response) => {
  try {
    const { id } = espacioIdSchema.parse(req.params);

    const data = await EspaciosService.disponibilidad(id);

    return res.json({
      ok: true,
      ...data,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "ID inválido" });
    }

    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    }

    console.error("❌ [disponibilidad] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al obtener disponibilidad" });
  }
};
