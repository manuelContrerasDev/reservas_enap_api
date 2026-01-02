// ============================================================
// admin-list.controller.ts — ENAP 2025 (FINAL)
// ============================================================

import { Response } from "express";
import type { AuthRequest } from "../../../types/global";

import { ReservasAdminListService } from "../../../services/reservas";
import { reservaToDTO } from "../../reservas/utils/reservaToDTO";
import { adminReservasQuerySchema } from "../../../validators/reservas";

/**
 * GET /api/reservas
 * Uso exclusivo ADMIN
 * Listado paginado con filtros avanzados
 */
export const obtenerReservasAdmin = async (req: AuthRequest, res: Response) => {
  try {
    // 🔐 Auth + rol ADMIN garantizados por router
    const query = adminReservasQuerySchema.parse(req.query);

    const result = await ReservasAdminListService.ejecutar(query);

    return res.json({
      ok: true,
      meta: result.meta,
      data: result.data.map(reservaToDTO),
    });

  } catch (error: any) {
    const message = error?.message ?? "Error al obtener reservas";

    console.error("❌ [admin reservas]:", message);

    const status =
      message === "ESTADO_INVALIDO" ? 400 :
      message === "FECHA_INVALIDA" ? 400 :
      500;

    return res.status(status).json({
      ok: false,
      error: message,
    });
  }
};
