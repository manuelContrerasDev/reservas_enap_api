// src/controllers/tesoreria/admin/resumen-tesoreria.controller.ts
import type { AuthRequest } from "@/types/global";
import type { Response } from "express";
import { resumenTesoreriaService } from "@/domains/tesoreria/services/resumen-tesoreria.service";

function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("FECHA_INVALIDA");
  }
  return d;
}

export async function resumenTesoreriaController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const desde = parseDateOnly(req.query.desde as string | undefined);
    const hastaRaw = parseDateOnly(req.query.hasta as string | undefined);

    if (desde && hastaRaw && desde.getTime() > hastaRaw.getTime()) {
      return res.status(400).json({ ok: false, error: "RANGO_INVALIDO" });
    }

    // Normalizamos hasta fin del día
    const hasta =
      hastaRaw &&
      (() => {
        const d = new Date(hastaRaw);
        d.setHours(23, 59, 59, 999);
        return d;
      })();

    const data = await resumenTesoreriaService(req.user, {
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
