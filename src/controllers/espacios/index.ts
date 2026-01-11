// src/controllers/espacios/index.ts

import { catalogo } from "./catalogo.controller";
import { detalle } from "./detalle.controller";
import { disponibilidad } from "./disponibilidad.controller";

import { crear } from "./crear.controller";
import { actualizar } from "./actualizar.controller";
import { adminList } from "./admin-list.controller";
import { toggleActivo } from "./toggle-activo.controller";
import { desactivar } from "./desactivar.controller";
import { eliminar } from "./eliminar.controller";

// 🆕 NUEVOS FLUJOS PROFESIONALES
import { catalogoProductosController } from "./catalogo-productos.controller";
import { catalogoProductosDisponibilidadController } from "./catalogo-productos-disponibilidad.controller";

export const EspaciosController = {
  // Público (legacy)
  catalogo,
  disponibilidad,
  detalle,

  // Público (nuevo flujo profesional)
  catalogoProductos: catalogoProductosController,
  catalogoProductosDisponibilidad:
    catalogoProductosDisponibilidadController,

  // Admin
  crear,
  actualizar,
  adminList,
  toggleActivo,
  desactivar,
  eliminar,
};
