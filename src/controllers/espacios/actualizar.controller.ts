import { Request, Response } from "express";
import { EspaciosService } from "../../services/espacios";

import {
  actualizarEspacioSchema,
  espacioIdSchema,
} from "../../validators/espacios";

export const actualizar = async (req: Request, res: Response) => {
  try {
    // Validate params
    const { id } = espacioIdSchema.parse(req.params);

    // Validate body
    const body = actualizarEspacioSchema.parse(req.body);

    const espacio = await EspaciosService.actualizar(id, body);

    return res.json({
      ok: true,
      message: "Espacio actualizado correctamente",
      data: espacio,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "Datos inválidos", issues: error.issues });
    }

    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    }

    console.error("❌ [actualizar] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al actualizar espacio" });
  }
};
