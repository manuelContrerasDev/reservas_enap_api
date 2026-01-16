import { Request, Response } from "express";
import { EspaciosService } from "@/domains/espacios/services";
import { espacioIdSchema } from "@/domains/espacios/validators";

export const detalle = async (req: Request, res: Response) => {
  // 🔐 ADMIN only (definir en routes/middleware)

  const paramsParsed = espacioIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ ok: false, error: "ID inválido" });
  }

  try {
    const espacio = await EspaciosService.detalle(paramsParsed.data.id);

    return res.json({ ok: true, data: espacio });
  } catch (error: any) {
    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    }

    console.error("❌ [ESPACIOS][DETALLE]", {
      error,
      userId: (req as any)?.user?.id,
      ip: req.ip,
    });

    return res.status(500).json({
      ok: false,
      error: "Error al obtener espacio",
    });
  }
};
