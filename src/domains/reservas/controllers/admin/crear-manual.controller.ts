// ============================================================
// crearReservaManualAdmin.controller.ts — ENAP 2025 (PRO)
// ============================================================

import { Response } from "express";
import type { AuthRequest } from "../../../../types/global";
import { Role } from "@prisma/client";

import {
  reservaManualRequestSchema,
  type ReservaManualRequest,
} from "../../validators/reservaManual.schema";

import { ReservaManualService } from "../../services/reserva-manual.service";
import { reservaToDTO } from "../../mappers/reservaToDTO";

export const crearReservaManualAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    /* =========================================================
     * Auth
     * ========================================================= */
    if (!req.user?.id) {
      return res.status(403).json({
        ok: false,
        error: "ADMIN_ID_REQUERIDO",
      });
    }

    /* =========================================================
     * Payload
     * ========================================================= */
    const payload: ReservaManualRequest =
      reservaManualRequestSchema.parse(req.body);

    /* =========================================================
     * Service
     * ========================================================= */
    const reserva = await ReservaManualService.crear(
      payload,
      req.user.id // adminId
    );

    return res.status(201).json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    const message = error?.message ?? "ERROR_CREAR_RESERVA_MANUAL";

    // 🔍 log técnico (sin filtrar data sensible)
    console.error("❌ [RESERVA_MANUAL_ADMIN]", {
      adminId: req.user?.id,
      espacioId: req.body?.espacioId,
      error: message,
    });

    const statusMap: Record<string, number> = {
      // Auth
      NO_AUTORIZADO_ADMIN: 403,
      ADMIN_ID_REQUERIDO: 403,

      // Sistema
      SYSTEM_USER_NO_CONFIGURADO: 500,

      // Datos
      TIPO_CLIENTE_INVALIDO: 400,
      DEBE_HABER_AL_MENOS_1_ADULTO: 400,
      FECHAS_INVALIDAS: 400,
      FECHA_FIN_INVALIDA: 400,
      DIAS_INVALIDOS: 400,

      // Reglas
      INICIO_LUNES_NO_PERMITIDO: 409,
      CAPACIDAD_CABANA_SUPERADA: 409,
      CAPACIDAD_QUINCHO_SUPERADA: 409,
      INVITADOS_SUPERAN_DECLARADO: 409,
      FECHAS_NO_DISPONIBLES: 409,

      // Recursos
      ESPACIO_NOT_FOUND: 404,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
