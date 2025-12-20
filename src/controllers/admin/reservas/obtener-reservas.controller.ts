// src/controllers/reservas/admin-list.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../../types/global";

import { ReservasAdminListService } from "../../../services/reservas";
import { reservaToDTO } from "../../reservas/utils/reservaToDTO";
import { adminReservasQuerySchema } from "../../../validators/reservas";

export const obtenerReservasAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        ok: false,
        error: "NO_AUTORIZADO_ADMIN",
      });
    }

    const query = adminReservasQuerySchema.parse(req.query);

    const result = await ReservasAdminListService.ejecutar(query);

    return res.json({
      ok: true,
      meta: result.meta,
      data: result.data.map(reservaToDTO),
    });

  } catch (error: any) {
    console.error("❌ [admin reservas]:", error);

    return res.status(500).json({
      ok: false,
      error: error.message ?? "Error al obtener reservas",
    });
  }
};
