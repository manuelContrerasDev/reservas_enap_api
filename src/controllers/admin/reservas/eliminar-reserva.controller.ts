import type { AuthRequest } from "../../../types/global";
import { Response } from "express";
import { EliminarReservaService } from "../../../services/reservas";

export const eliminarReservaAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    await EliminarReservaService.ejecutar(req.params.id, req.user);

    return res.json({
      ok: true,
      message: "Reserva eliminada por administrador",
    });

  } catch (err: any) {
    console.error("❌ [admin eliminar reserva]:", err);

    const map: Record<string, number> = {
      NO_AUTH: 401,
      NO_ADMIN: 403,
      NOT_FOUND: 404,
    };

    return res.status(map[err.message] ?? 500).json({
      ok: false,
      error: err.message,
    });
  }
};
