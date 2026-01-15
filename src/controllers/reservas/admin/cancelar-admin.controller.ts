import { Response } from "express";
import type { AuthRequest } from "@/types/global";

import { CancelarReservaAdminService } from "@/services/reservas/cancelar-reserva-admin.service";
import { cancelarReservaAdminSchema } from "@/validators/reservas/cancelar-reserva-admin.schema";
import { reservaToDTO } from "../utils/reservaToDTO";

/**
 * ❌ CANCELAR RESERVA (ADMIN)
 * PATCH /api/reservas/admin/:id/cancelar
 */
export const cancelarReservaAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const admin = req.user!;
  const reservaId = req.params.id;

  const payload = cancelarReservaAdminSchema.parse(req.body ?? {});

  const reserva = await CancelarReservaAdminService.ejecutar(
    reservaId,
    admin,
    payload.motivo
  );

  return res.json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};
