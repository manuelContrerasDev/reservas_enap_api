import { catalogo } from "./catalogo.controller";
import { detalle } from "./detalle.controller";
//import { detallePublico } from ".detalle-publico.controller";
import { disponibilidad } from "./disponibilidad.controller";

import { crear } from "./crear.controller";
import { actualizar } from "./actualizar.controller";
import { adminList } from "./admin-list.controller";
import { toggleActivo } from "./toggle-activo.controller";
import { desactivar } from "./desactivar.controller";
import { eliminar } from "./eliminar.controller";

export const EspaciosController = {
  // Público
  catalogo,
  //detallePublico,
  disponibilidad,

  // Admin
  crear,
  actualizar,
  adminList,
  toggleActivo,
  desactivar,
  eliminar,
  detalle,
};
