// src/controllers/reservas/subirComprobante.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../../../types/global";
import { SubirComprobanteService } from "../../services/shared/subir-comprobante.service";
import { reservaToDTO } from "../../mappers/reservaToDTO";

export const subirComprobante = async (req: AuthRequest, res: Response) => {
  const reserva = await SubirComprobanteService.ejecutar(
    req.params.id,
    req.body, // ya validado por middleware
    req.user!
  );

  return res.json({
    ok: true,
    data: reservaToDTO(reserva),
  });
};
