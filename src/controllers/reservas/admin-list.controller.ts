// src/controllers/reservas/admin-list.controller.ts

import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ReservasAdminListService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const adminList = async (req: AuthRequest, res: Response) => {
  try {
    const result = await ReservasAdminListService.ejecutar(req.query);

    return res.json({
      ok: true,
      meta: result.meta,
      data: result.data.map(reservaToDTO),
    });

  } catch (error: any) {
    console.error("❌ [admin reservas]:", error);

    return res
      .status(500)
      .json({ ok: false, error: "Error al obtener reservas" });
  }
};
