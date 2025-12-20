// ============================================================
// editar.controller.ts — ENAP 2025
// ============================================================

import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { editReservaSchema } from "../../validators/reservas/edit-reserva.schema";
import { EditarReservaService } from "../../services/reservas/editar-reserva.service";
import { reservaToDTO } from "./utils/reservaToDTO";

export const editarReserva = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("NO_AUTH");

    const payload = editReservaSchema.parse(req.body);

    const reserva = await EditarReservaService.ejecutar(
      req.params.id,
      payload,
      req.user
    );

    return res.json({
      ok: true,
      message: "Reserva actualizada correctamente",
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {
    console.error("❌ [editar reserva]:", error);

    const statusMap: Record<string, number> = {
      NO_AUTH: 401,
      NOT_FOUND: 404,
      NO_PERMITIDO: 403,
      NO_PERMITIDO_TIEMPO: 400,
      RESERVA_NO_MODIFICABLE: 400,
    };

    return res.status(statusMap[error.message] ?? 500).json({
      ok: false,
      error: error.message ?? "Error al editar reserva",
    });
  }
};
