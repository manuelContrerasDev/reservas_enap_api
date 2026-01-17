import { Response } from "express";
import type { AuthRequest } from "../../../../types/global";

import { ReservasAdminListService } from "../../services";
import { reservaToDTO } from "../../mappers/reservaToDTO";
import { adminReservasQuerySchema } from "../../validators";

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
      message === "FECHA_INVALIDA" ? 400 : 500;

    return res.status(status).json({
      ok: false,
      error: message,
    });
  }
};
