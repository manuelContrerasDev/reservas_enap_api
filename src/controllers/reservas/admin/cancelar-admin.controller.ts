import { Response } from "express";
import type { AuthRequest } from "../../../types/global";

import { CancelarReservaAdminService } from "../../../services/reservas/cancelar-reserva-admin.service";
import { cancelarReservaAdminSchema } from "../../../validators/reservas/cancelar-reserva-admin.schema";
import { reservaToDTO } from "../utils/reservaToDTO";

export const cancelarReservaAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user;
    if (!admin) return res.status(401).json({ ok: false, error: "NO_AUTH" });

    const reservaId = req.params.id;

    const payload = cancelarReservaAdminSchema.parse(req.body ?? {});
    const reserva = await CancelarReservaAdminService.ejecutar(
      reservaId,
      admin,
      payload.motivo
    );

    return res.json({
      ok: true,
      message: "Reserva cancelada por administrador",
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    const message = error?.message ?? "ERROR_CANCELAR_ADMIN";
    console.error("❌ [cancelar reserva admin]:", message);

    const statusMap: Record<string, number> = {
      NO_AUTH: 401,
      NO_AUTORIZADO_ADMIN: 403,
      INVALID_ID: 400,
      NOT_FOUND: 404,
      RESERVA_NO_CANCELABLE: 409,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
