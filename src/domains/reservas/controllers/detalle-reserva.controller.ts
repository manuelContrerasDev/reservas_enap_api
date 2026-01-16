import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { DetalleReservaService } from "../services/detalle-reserva.service";
import { reservaToDTO } from "../utils/reservaToDTO";

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
