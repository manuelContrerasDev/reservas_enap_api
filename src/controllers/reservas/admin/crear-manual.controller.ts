import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { Role } from "@prisma/client";

import {
  reservaManualRequestSchema,
  ReservaManualRequest,
} from "../../../validators/reservas/reservaManual.schema";

import { ReservaManualService } from "../../../services/reservas/reserva-manual.service";
import { reservaToDTO } from "../../reservas/utils/reservaToDTO";

export const crearReservaManualAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ ok: false, error: "NO_AUTORIZADO_ADMIN" });
    }

    const payload: ReservaManualRequest = reservaManualRequestSchema.parse(req.body);

    const reserva = await ReservaManualService.crear(payload);

    return res.status(201).json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (error: any) {
    const message = error?.message ?? "ERROR_CREAR_RESERVA_MANUAL";
    console.error("❌ [crear reserva manual]:", message);

    const statusMap: Record<string, number> = {
      NO_AUTORIZADO_ADMIN: 403,
      USER_ID_REQUERIDO: 400,
      ESPACIO_ID_REQUERIDO: 400,
      ADMIN_ID_REQUERIDO: 400,
      USER_NOT_FOUND: 404,
      ESPACIO_NOT_FOUND: 404,
      FECHAS_INVALIDAS: 400,
      FECHA_FIN_INVALIDA: 400,
      INICIO_LUNES_NO_PERMITIDO: 409,
      DIAS_INVALIDOS: 400,
      CAPACIDAD_CABANA_SUPERADA: 409,
      CAPACIDAD_QUINCHO_SUPERADA: 409,
      FECHAS_NO_DISPONIBLES: 409,
      INVITADOS_INVALIDOS: 400,
      INVITADOS_SUPERAN_DECLARADO: 409,
      ERROR_CREAR_RESERVA_MANUAL: 500,
    };

    return res.status(statusMap[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
