// src/controllers/tesoreria/admin/listar-movimientos.controller.ts
import type { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { listarMovimientosTesoreriaService } from "../services/listar-movimientos.service";

function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined;

  // Esperamos YYYY-MM-DD
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("FECHA_INVALIDA");
  }
  return d;
}

export async function listarMovimientosTesoreriaController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const desde = parseDateOnly(req.query.desde as string | undefined);
    const hasta = parseDateOnly(req.query.hasta as string | undefined);

    if (desde && hasta && desde.getTime() > hasta.getTime()) {
      return res.status(400).json({ ok: false, error: "RANGO_INVALIDO" });
    }

    const data = await listarMovimientosTesoreriaService(req.user, {
      desde,
      hasta,
    });

    return res.status(200).json({ ok: true, data });
  } catch (error: any) {
    const map: Record<string, number> = {
      NO_AUTH: 401,
      NO_AUTORIZADO_ADMIN: 403,
      FECHA_INVALIDA: 400,
      RANGO_INVALIDO: 400,
    };

    return res.status(map[error.message] ?? 500).json({
      ok: false,
      error: error.message ?? "INTERNAL_ERROR",
    });
  }
}
