// src/controllers/admin/reservas/confirmar-reserva-admin.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../../../types/global";
import { adminConfirmarReservaSchema } from "../../validators/admin-confirmar-reserva.schema";
import { ConfirmarReservaAdminService } from "../../services/confirmar-reserva-admin.service";
import { reservaToDTO } from "../../utils/reservaToDTO";

export const confirmarReservaAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    adminConfirmarReservaSchema.parse(req.body);

    const reserva = await ConfirmarReservaAdminService.ejecutar({
      reservaId: req.params.id,
      adminId: req.user.id,
      adminRole: req.user.role,
    });

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (err: any) {
    const message = err?.message ?? "ERROR_CONFIRMAR_RESERVA";

    const map: Record<string, number> = {
      NO_AUTORIZADO_ADMIN: 403,
      RESERVA_NOT_FOUND: 404,
      ESTADO_INVALIDO: 409,
    };

    return res.status(map[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
