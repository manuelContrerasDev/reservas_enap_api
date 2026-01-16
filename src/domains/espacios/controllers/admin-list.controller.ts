import { Request, Response } from "express";
import { EspaciosService } from "@/domains/espacios/services";

export const adminList = async (req: Request, res: Response) => {
  // 🔐 ADMIN only (middleware de rutas)

  try {
    const data = await EspaciosService.adminList();

    return res.json({ ok: true, data });
  } catch (error) {
    console.error("❌ [ESPACIOS][ADMIN_LIST]", {
      error,
      userId: (req as any)?.user?.id,
      ip: req.ip,
    });

    return res.status(500).json({
      ok: false,
      error: "Error al obtener espacios",
    });
  }
};
