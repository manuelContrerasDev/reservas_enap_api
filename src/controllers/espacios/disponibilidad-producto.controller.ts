import { Request, Response } from "express";
import { TipoEspacio } from "@prisma/client";
import { disponibilidadProductoService } from "@/domains/espacios/services/publico/productos/disponibilidad-producto.service";

export async function disponibilidadProductoController(
  req: Request,
  res: Response
) {
  const { tipo } = req.params;
  const { fechaInicio, fechaFin } = req.query;

  if (
    typeof fechaInicio !== "string" ||
    typeof fechaFin !== "string"
  ) {
    return res.status(400).json({
      ok: false,
      error: "Rango de fechas requerido",
    });
  }

  const result = await disponibilidadProductoService(
    tipo as TipoEspacio,
    fechaInicio,
    fechaFin
  );

  return res.json({ ok: true, data: result });
}
