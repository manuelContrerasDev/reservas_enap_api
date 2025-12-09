import { crear } from "./crear.controller";
import { mias } from "./mias.controller";
import { adminList } from "./admin-list.controller";
import { obtener } from "./obtener.controller";
import { actualizarEstado } from "./actualizar-estado.controller";
import { eliminar } from "./eliminar.controller";
import { disponibilidadPiscina } from "./disponibilidad-piscina.controller";
import { actualizarInvitados } from "./actualizar-invitados.controller";

export const ReservasController = {
  crear,
  mias,
  adminList,
  obtener,
  actualizarEstado,
  eliminar,
  disponibilidadPiscina,
  actualizarInvitados,
};
