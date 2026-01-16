import { Request, Response } from "express";
import { catalogoProductosService } from "../../domains/espacios/services/publico/productos/catalogo-productos.service";

export async function catalogoProductosController(
  _req: Request,
  res: Response
) {
  const productos = await catalogoProductosService();
  res.json({ ok: true, data: productos });
}
