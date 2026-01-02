import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { ZodError } from "zod";

import { CrearReservaService } from "../../services/reservas";
import { reservaToDTO } from "./utils/reservaToDTO";
import { crearReservaSchema } from "../../validators/reservas";

export const crearReserva = async (req: AuthRequest, res: Response) => {
  try {
    /* ============================================================
     * 🔐 Auth obligatoria
     * ============================================================ */
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: "NO_AUTH",
      });
    }

    /* ============================================================
     * ✅ Validación Zod (única fuente de verdad)
     * ============================================================ */
    const payload = crearReservaSchema.parse(req.body);

    /* ============================================================
     * 🧠 Service de negocio
     * ============================================================ */
    const reserva = await CrearReservaService.ejecutar(payload, req.user);

    return res.status(201).json({
      ok: true,
      data: reservaToDTO(reserva),
    });

  } catch (error: any) {

    /* ============================================================
     * ❌ Errores de validación Zod
     * ============================================================ */
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        error: "VALIDATION_ERROR",
        issues: error.issues,
      });
    }

    const message = error?.message ?? "ERROR_CREAR_RESERVA";

    console.error("❌ [crear reserva]", {
      error: message,
      userId: req.user?.id,
    });

    /* ============================================================
     * 🎯 Mapear errores de dominio → HTTP
     * ============================================================ */
    const status =
      message === "NO_AUTH" ? 401 :
      message === "ESPACIO_NOT_FOUND" ? 404 :
      message === "FECHAS_NO_DISPONIBLES" ? 409 :
      message === "CAPACIDAD_CABANA_SUPERADA" ? 409 :
      message === "CAPACIDAD_QUINCHO_SUPERADA" ? 409 :
      message === "DIAS_INVALIDOS" ? 400 :
      message === "FECHAS_INVALIDAS" ? 400 :
      message === "INICIO_LUNES_NO_PERMITIDO" ? 400 :
      message === "ERROR_CREAR_INVITADOS" ? 500 :
      message === "ERROR_CREAR_RESERVA" ? 500 :
      500;

    return res.status(status).json({
      ok: false,
      error: message,
    });
  }
};
