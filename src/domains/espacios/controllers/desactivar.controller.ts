import { Request, Response } from "express";
import { EspaciosService } from "../../domains/espacios/services";
import { espacioIdSchema } from "../../validators/espacios";

export const desactivar = async (req: Request, res: Response) => {
  try {
    const { id } = espacioIdSchema.parse(req.params);

    const espacio = await EspaciosService.desactivar(id);

    return res.json({
      ok: true,
      message: "Espacio desactivado correctamente",
      data: espacio,
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "ID inválido", issues: error.issues });
    }

    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    }

    console.error("❌ [desactivar] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al desactivar espacio" });
  }
};
