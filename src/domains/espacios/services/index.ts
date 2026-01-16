// src/services/espacios/index.ts
import { catalogoService } from "./publico/catalogo.service";
import { detalleService } from "./publico/detalle.service";
import { DisponibilidadEspacioService } from "./publico/disponibilidad.service";

import { crearService } from "./admin/crear.service";
import { actualizarService } from "./admin/actualizar.service";
import { adminListService } from "./admin/admin-list.service";
import { toggleActivoService } from "./admin/toggle-activo.service";
import { desactivarService } from "./admin/desactivar.service";
import { eliminarService } from "./admin/eliminar.service";

export const EspaciosService = {
  // SOCIO / EXTERNO
  catalogo: catalogoService,
  detalle: detalleService,
  disponibilidadEspacio: DisponibilidadEspacioService,

  // ADMIN
  crear: crearService,
  actualizar: actualizarService,
  adminList: adminListService,
  toggleActivo: toggleActivoService,
  desactivar: desactivarService,
  eliminar: eliminarService,
};
