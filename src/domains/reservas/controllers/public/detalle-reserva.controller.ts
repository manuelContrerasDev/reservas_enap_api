import { Response } from "express";
import type { AuthRequest } from "../../../../types/global";
import { DetalleReservaService } from "@/domains/reservas/services/public/detalle-reserva.service";
import { reservaToDTO } from "../../mappers/reservaToDTO";

export const detalleReserva = async (req: AuthRequest, res: Response) => {
  const reserva = await DetalleReservaService.ejecutar(
    req.params.id,
    req.user!
  );

  return res.json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};
