import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { CrearReservaService } from "../services";
import { reservaToDTO } from "../utils/reservaToDTO";

export const crearReserva = async (req: AuthRequest, res: Response) => {
  // 🔒 authGuard ya garantiza req.user
  const reserva = await CrearReservaService.ejecutar(req.body, req.user!);

  return res.status(201).json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};
