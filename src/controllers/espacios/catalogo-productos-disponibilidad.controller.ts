import { Request, Response } from "express";
import { TipoEspacio } from "@prisma/client";
import { disponibilidadProductoService } from "@/services/espacios/socio/productos/disponibilidad-producto.service";

export async function catalogoProductosDisponibilidadController(req: Request, res: Response) {
  const { tipo } = req.params;
  const { fechaInicio, fechaFin } = req.query;

  // validateQuery ya lo asegura, pero igual mantenemos hardening
  if (typeof fechaInicio !== "string" || typeof fechaFin !== "string") {
    return res.status(400).json({ ok: false, error: "RANGO_FECHAS_REQUERIDO" });
  }

  const data = await disponibilidadProductoService(tipo as TipoEspacio, fechaInicio, fechaFin);

  return res.json({ ok: true, data: { ...data, rango: { fechaInicio, fechaFin } } });
}
