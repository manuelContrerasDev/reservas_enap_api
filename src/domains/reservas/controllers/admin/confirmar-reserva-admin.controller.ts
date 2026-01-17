import { Response } from "express";
import type { AuthRequest } from "@/types/global";

import { adminConfirmarReservaSchema } from "@/domains/reservas/validators";
import { ConfirmarReservaAdminService } from "@/domains/reservas/services";
import { reservaToDTO } from "@/domains/reservas/mappers/reservaToDTO";

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
  } catch (error: any) {
    const message = error?.message ?? "ERROR_CONFIRMAR_RESERVA";

    const map: Record<string, number> = {
      NO_AUTORIZADO_ADMIN: 403,
      RESERVA_NOT_FOUND: 404,
      RESERVA_SIN_ESPACIO: 409,
      ESTADO_INVALIDO: 409,
    };

    return res.status(map[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
