import { Response } from "express";
import type { AuthRequest } from "@/types/global";

import { CancelarReservaAdminService } from "@/domains/reservas/services/cancelar-reserva-admin.service";
import { cancelarReservaAdminSchema } from "@/domains/reservas/validators/cancelar-reserva-admin.schema";
import { reservaToDTO } from "../../utils/reservaToDTO";

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
