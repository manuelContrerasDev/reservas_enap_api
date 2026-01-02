import { Request, Response } from "express";
import { EspaciosService } from "../../services/espacios";
import { espacioIdSchema } from "../../validators/espacios";

export const eliminar = async (req: Request, res: Response) => {
  const parsed = espacioIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "ID inválido" });
  }

  try {
    await EspaciosService.desactivar(parsed.data.id); // soft-delete

    return res.json({
      ok: true,
      message: "Espacio desactivado correctamente",
    });
  } catch (error: any) {
    if (error?.message === "ESPACIO_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    }

    console.error("❌ [ESPACIOS][ELIMINAR]", {
      error,
      userId: (req as any)?.user?.id,
      ip: req.ip,
    });

    return res.status(500).json({
      ok: false,
      error: "Error al eliminar espacio",
    });
  }
};

