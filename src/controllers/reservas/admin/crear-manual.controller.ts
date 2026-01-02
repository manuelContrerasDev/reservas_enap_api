// src/controllers/reservas/admin/crear-manual.controller.ts
import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { reservaManualSchema } from "../../../validators/reservas/reservaManual.schema";
import { ReservaManualService } from "../../../services/reservas/reserva-manual.service";

export const crearReservaManualAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "NO_AUTORIZADO_ADMIN" });
    }

    const payload = reservaManualSchema.parse(req.body);
    const reserva = await ReservaManualService.crear(payload);

    return res.status(201).json({ ok: true, data: reserva });

  } catch (error: any) {
    console.error("❌ [crear reserva manual]:", error.message);
    return res.status(400).json({
      ok: false,
      error: error.message ?? "ERROR_CREAR_RESERVA_MANUAL",
    });
  }
};
