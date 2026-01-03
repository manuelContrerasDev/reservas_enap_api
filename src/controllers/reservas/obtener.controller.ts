import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { ObtenerReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const obtener = async (req: AuthRequest, res: Response) => {
  const reserva = await ObtenerReservaService.ejecutar(
    req.params.id,
    req.user!
  );

  return res.json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};
