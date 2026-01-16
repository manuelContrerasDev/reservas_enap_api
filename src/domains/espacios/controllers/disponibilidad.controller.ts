// src/controllers/espacios/disponibilidad.controller.ts
import { Request, Response } from "express";
import { EspaciosService } from "@/domains/espacios/services";
import {
  espacioIdSchema,
  disponibilidadRangoSchema,
} from "@/domains/espacios/validators/";

export const disponibilidad = async (req: Request, res: Response) => {
  try {
    const { id } = espacioIdSchema.parse(req.params);
    const { fechaInicio, fechaFin } =
      disponibilidadRangoSchema.parse(req.query);

    const data = await EspaciosService.disponibilidadEspacio.ejecutar(
      id,
      fechaInicio,
      fechaFin
    );

    return res.json({
      ok: true,
      data,
    });

  } catch (error: any) {
    const message = error?.message ?? "ERROR_DISPONIBILIDAD";

    console.error("❌ [disponibilidad espacio]:", message);

    const status =
      error?.name === "ZodError" ? 400 :
      message === "ESPACIO_NO_DISPONIBLE" ? 404 :
      message === "TIPO_NO_SOPORTADO" ? 400 :
      message === "CAPACIDAD_NO_CONFIGURADA" ? 500 :
      500;

    return res.status(status).json({
      ok: false,
      error: message,
      issues: error?.issues,
    });
  }
};
