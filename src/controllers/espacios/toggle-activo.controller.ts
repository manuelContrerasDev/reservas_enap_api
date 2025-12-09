import { Request, Response } from "express";
import { EspaciosService } from "../../services/espacios";
import { toggleEspacioSchema } from "../../validators/espacios";

export const toggleActivo = async (req: Request, res: Response) => {
  try {
    const { id } = toggleEspacioSchema.parse(req.params);

    const espacio = await EspaciosService.toggleActivo(id);

    return res.json({
      ok: true,
      data: espacio,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "ID inválido" });
    }

    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    }

    console.error("❌ [toggleActivo] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al cambiar estado" });
  }
};
