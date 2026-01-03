import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { ReservasMiasService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";

export const misReservas = async (req: AuthRequest, res: Response) => {
  // 🔒 authGuard garantiza req.user
  const reservas = await ReservasMiasService.ejecutar(req.user!);

  return res.json({
    ok: true,
    data: reservas.map(reservaToDTO),
  });
};
