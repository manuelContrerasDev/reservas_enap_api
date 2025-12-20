import { Response } from "express";
import type { AuthRequest } from "../../types/global";

import { CrearReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";
import { crearReservaSchema } from "../../validators/reservas";

export const crearReserva = async (req: AuthRequest, res: Response) => {
  try {
    /* ============================================================
     * 🔐 0) Auth obligatorio
     * ============================================================ */
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: "NO_AUTH",
      });
    }

    /* ============================================================
     * 1) Validación Zod
     * ============================================================ */
    const payload = crearReservaSchema.parse(req.body);

    /* ============================================================
     * 2) Ejecutar service (user garantizado)
     * ============================================================ */
    const reserva = await CrearReservaService.ejecutar(payload, req.user);

    return res.status(201).json({
      ok: true,
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {
    console.error("❌ [crear reserva]:", error);

    const message = error.message ?? "Error al crear reserva";

    /* ============================================================
     * 🎯 Mapear errores de dominio → HTTP Status
     * ============================================================ */
    const status =
      message === "NO_AUTH" ? 401 :
      message === "ESPACIO_NOT_FOUND" ? 404 :
      message === "FECHAS_NO_DISPONIBLES" ? 409 :
      message === "DIAS_INVALIDOS" ? 400 :
      message === "CAPACIDAD_CABANA_SUPERADA" ? 409 :
      message === "CAPACIDAD_QUINCHO_SUPERADA" ? 409 :
      message === "FECHAS_INVALIDAS" ? 400 :
      message === "FECHA_FIN_MENOR" ? 400 :
      message === "INICIO_LUNES_NO_PERMITIDO" ? 400 :
      400;

    return res.status(status).json({
      ok: false,
      error: message,
    });
  }
};
