// src/controllers/tesoreria/admin/exportar-movimientos-xlsx.controller.ts
import { Response } from "express";
import type { AuthRequest } from "@/types/global";
import { exportarMovimientosXlsxService } from "@/services/tesoreria/admin/exportar-movimientos-xlsx.service";

function parseDateOnly(input?: string): Date | undefined {
  if (!input) return undefined;
  // Esperamos YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) throw new Error("FECHA_INVALIDA");
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("FECHA_INVALIDA");
  return d;
}

function safeFilenamePart(v?: string) {
  return (v ?? "")
    .trim()
    .replace(/[^0-9a-zA-Z_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function exportarMovimientosXlsxController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const { desde, hasta } = req.query as { desde?: string; hasta?: string };

    // Validación / normalización
    const desdeDate = parseDateOnly(desde);
    const hastaDate = parseDateOnly(hasta);

    if (desdeDate && hastaDate && desdeDate.getTime() > hastaDate.getTime()) {
      return res.status(400).json({ ok: false, error: "RANGO_INVALIDO" });
    }

    const buffer = await exportarMovimientosXlsxService(req.user, {
      desde,
      hasta,
    });

    const partDesde = safeFilenamePart(desde) || "inicio";
    const partHasta = safeFilenamePart(hasta) || "hoy";
    const filename = `tesoreria_${partDesde}_${partHasta}.xlsx`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(buffer);
  } catch (error: any) {
    const map: Record<string, number> = {
      NO_AUTORIZADO_ADMIN: 403,
      FECHA_INVALIDA: 400,
      RANGO_INVALIDO: 400,
    };

    return res.status(map[error?.message] ?? 500).json({
      ok: false,
      error: error?.message ?? "ERROR",
    });
  }
}
