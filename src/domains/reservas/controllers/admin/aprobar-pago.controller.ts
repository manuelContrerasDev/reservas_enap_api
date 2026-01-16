import { Response } from "express";
import type { AuthRequest } from "@/types/global";
import { aprobarPagoService } from "@/domains/reservas/services/aprobar-pago.service";
import { reservaToDTO } from "../../mappers/reservaToDTO";

/**
 * ✅ APROBAR PAGO (ADMIN)
 * PATCH /api/reservas/admin/:id/confirmar
 */
export const aprobarPagoAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const admin = req.user!;
  const reservaId = req.params.id;
  const payload = req.body ?? {};

  const reserva = await aprobarPagoService(
    reservaId,
    admin,
    payload
  );

  return res.json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};
