import type { AuthRequest } from "../../../types/global";
import { Response } from "express";
import { EliminarReservaService } from "../../../services/reservas";

export const eliminarReservaAdmin = async (req: AuthRequest, res: Response) => {
  try {
    // 🔐 auth + rol garantizados por router
    await EliminarReservaService.ejecutar(req.params.id, req.user!);

    return res.json({
      ok: true,
      message: "Reserva eliminada por administrador",
    });

  } catch (err: any) {
    const message = err?.message ?? "Error al eliminar reserva";

    console.error("❌ [admin eliminar reserva]:", message);

    const map: Record<string, number> = {
      NO_AUTORIZADO_ADMIN: 403,
      NOT_FOUND: 404,
      RESERVA_NO_ELIMINABLE: 409,
    };

    return res.status(map[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
