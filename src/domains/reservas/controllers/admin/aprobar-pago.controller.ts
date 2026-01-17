import { Response } from "express";
import type { AuthRequest } from "@/types/global";
import { AprobarPagoAdminService } from "@/domains/reservas/services/admin/aprobar-pago-admin.service";
import { reservaToDTO } from "../../mappers/reservaToDTO";

/**
 * ✅ APROBAR PAGO (ADMIN)
 * PATCH /api/reservas/admin/:id/confirmar
 */
export const aprobarPagoAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const reserva = await AprobarPagoAdminService(
    req.params.id,
    req.user!,
    req.body // ya validado
  );

  return res.json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};

