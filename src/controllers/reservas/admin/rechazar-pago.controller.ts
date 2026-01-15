import { Response } from "express";
import type { AuthRequest } from "@/types/global";
import { rechazarPagoService } from "@/services/reservas/rechazar-pago.service";
import { reservaToDTO } from "../utils/reservaToDTO";

/**
 * ❌ RECHAZAR PAGO (ADMIN)
 * PATCH /api/reservas/admin/:id/rechazar
 */
export const rechazarPagoAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const admin = req.user!;
  const reservaId = req.params.id;
  const { motivo } = req.body ?? {};

  const reserva = await rechazarPagoService(
    reservaId,
    admin,
    motivo
  );

  return res.json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};
