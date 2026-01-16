// src/controllers/tesoreria/admin/export-movimientos.controller.ts
import type { AuthRequest } from "@/types/global";
import { Response } from "express";
import { exportMovimientosTesoreriaService } from "@/domains/tesoreria/services/export-movimientos.service";

function toCSV(rows: any[]) {
  const header = [
    "Fecha",
    "Reserva ID",
    "Socio",
    "Espacio",
    "Monto CLP",
    "Referencia",
    "Admin",
  ];

  const lines = rows.map((m) => [
    new Date(m.createdAt).toISOString(),
    m.reserva.id,
    m.reserva.nombreSocio,
    m.reserva.espacio.nombre,
    m.montoClp,
    m.referencia ?? "",
    m.creadoPor.name ?? m.creadoPor.email,
  ]);

  return [header, ...lines]
    .map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export async function exportMovimientosTesoreriaController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const { desde, hasta } = req.query as {
      desde?: string;
      hasta?: string;
    };

    const movimientos = await exportMovimientosTesoreriaService(req.user, {
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta
        ? (() => {
            const d = new Date(hasta);
            d.setHours(23, 59, 59, 999);
            return d;
          })()
        : undefined,
    });

    const csv = toCSV(movimientos);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tesoreria_${Date.now()}.csv"`
    );

    return res.send(csv);
  } catch (e: any) {
    return res
      .status(e.message === "NO_AUTORIZADO_ADMIN" ? 403 : 500)
      .json({ ok: false, error: e.message });
  }
}
