import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { ReservasMiasService } from "../services";
import { reservaToDTO } from "../mappers/reservaToDTO";
import type { MisReservasQuery } from "../validators/mis-reservas.schema";

export const misReservas = async (req: AuthRequest, res: Response) => {
  const query = (req as any).validatedQuery as MisReservasQuery | undefined;

  const reservas = await ReservasMiasService.ejecutar(req.user!, query);

  return res.json({
    ok: true,
    data: reservas.map(reservaToDTO),
    meta: {
      page: query?.page ?? 1,
      limit: query?.limit ?? 10,
      estado: query?.estado ?? null,
    },
  });
};
