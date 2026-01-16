import { Request, Response } from "express";
import { EspaciosService } from "@/domains/espacios/services";
import { espacioIdSchema } from "@/domains/espacios/validators";

export const detallePublico = async (req: Request, res: Response) => {
  try {
    const { id } = espacioIdSchema.parse(req.params);
    const espacio = await EspaciosService.detalle(id);

    // opción: ocultar info admin si hiciera falta (por ahora igual que detalle)
    return res.json({ ok: true, data: espacio });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "ID inválido" });
    }
    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    }
    console.error("❌ [detallePublico] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al obtener espacio" });
  }
};
