import { Request, Response } from "express";
import { EspaciosService } from "../../domains/espacios/services";
import { crearEspacioSchema } from "../../validators/espacios";

export const crear = async (req: Request, res: Response) => {
  // 🔐 NOTA: este endpoint debe ser ADMIN only (ver routes / middleware)
  const parsed = crearEspacioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Datos inválidos",
      issues: parsed.error.issues,
    });
  }

  try {
    const espacio = await EspaciosService.crear(parsed.data);

    return res.status(201).json({
      ok: true,
      message: "Espacio creado correctamente",
      data: espacio,
    });
  } catch (error) {
    console.error("❌ [ESPACIOS][CREAR]", {
      error,
      userId: (req as any)?.user?.id,
      ip: req.ip,
    });

    return res.status(500).json({
      ok: false,
      error: "Error al crear espacio",
    });
  }
};
