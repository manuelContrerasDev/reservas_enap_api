import { Request, Response } from "express";
import { EspaciosService } from "../../services/espacios";

export const adminList = async (_req: Request, res: Response) => {
  try {
    const data = await EspaciosService.adminList();

    return res.json({ ok: true, data });
  } catch (error) {
    console.error("❌ [adminList] Error:", error);
    return res.status(500).json({ ok: false, error: "Error al obtener espacios" });
  }
};
