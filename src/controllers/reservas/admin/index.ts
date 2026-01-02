import { crearReservaManualAdmin } from "../../reservas/admin/crear-manual.controller";
import { eliminarReservaAdmin } from "../../reservas/admin/eliminar-reserva.controller";
import { obtenerReservasAdmin } from "./admin-list.controller";


export const ReservasAdminController = {
  crearReservaManualAdmin,
  eliminarReservaAdmin,
  obtenerReservasAdmin,
};