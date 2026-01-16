import { Response } from "express";
import type { AuthRequest } from "../../../../types/global";
import { Role } from "@prisma/client";

import {
  adminInvitadosSchema,
} from "../../validators/admin-invitados.schema";

import { AgregarInvitadosService } from "../../services/agregar-invitados.service";
import { reservaToDTO } from "../../utils/reservaToDTO";

export const agregarInvitadosAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ ok: false, error: "NO_AUTORIZADO_ADMIN" });
    }

    const payload = adminInvitadosSchema.parse(req.body);

    const reserva = await AgregarInvitadosService.ejecutar({
      reservaId: req.params.id,
      invitados: payload.invitados,
      adminId: req.user.id,
    });

    return res.json({
      ok: true,
      data: reservaToDTO(reserva),
    });
  } catch (err: any) {
    const message = err?.message ?? "ERROR_INVITADOS";

    console.error("❌ [admin invitados]:", message);

    const map: Record<string, number> = {
      RESERVA_NOT_FOUND: 404,
      ESTADO_INVALIDO: 409,
      INVITADOS_SUPERAN_DECLARADO: 409,
    };

    return res.status(map[message] ?? 500).json({
      ok: false,
      error: message,
    });
  }
};
