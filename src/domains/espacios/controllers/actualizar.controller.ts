import { Request, Response } from "express";
import { EspaciosService } from "../../domains/espacios/services";
import {
  actualizarEspacioSchema,
  espacioIdSchema,
} from "../../validators/espacios";

export const actualizar = async (req: Request, res: Response) => {
  // 🔐 ADMIN only (validar en middleware de rutas)

  const paramsParsed = espacioIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({
      ok: false,
      error: "ID inválido",
      issues: paramsParsed.error.issues,
    });
  }

  const bodyParsed = actualizarEspacioSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Datos inválidos",
      issues: bodyParsed.error.issues,
    });
  }

  try {
    const espacio = await EspaciosService.actualizar(
      paramsParsed.data.id,
      bodyParsed.data
    );

    return res.json({
      ok: true,
      message: "Espacio actualizado correctamente",
      data: espacio,
    });
  } catch (error: any) {
    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Espacio no encontrado",
      });
    }

    console.error("❌ [ESPACIOS][ACTUALIZAR]", {
      error,
      userId: (req as any)?.user?.id,
      ip: req.ip,
    });

    return res.status(500).json({
      ok: false,
      error: "Error al actualizar espacio",
    });
  }
};
