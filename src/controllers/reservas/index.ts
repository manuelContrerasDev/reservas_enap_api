// src/controllers/reservas/index.ts

import { crearReserva } from "./crear-reserva.controller";
import { misReservas } from "./mis-reservas.controller";
import { cancelarReserva } from "./cancelar-reserva.controller";
import { detalleReserva } from "./detalle-reserva.controller";
import { actualizarEstado } from "./actualizar-estado.controller";
import { disponibilidadPiscina } from "./disponibilidad-piscina.controller";
import { actualizarInvitados } from "./actualizar-invitados.controller";
import { editarReserva } from "./editar-reserva.controller";

import { obtenerReservasAdmin } from "./admin/admin-list.controller";
import { eliminarReservaAdmin } from "./admin/hardDeleteReservaAdmin.controller";
import { crearReservaManualAdmin } from "./admin/crear-manual.controller";

export const ReservasController = {
  crearReservaManualAdmin,
  obtenerReservasAdmin,
  eliminarReservaAdmin,
  editarReserva,
  crearReserva,
  misReservas,
  detalleReserva,
  actualizarEstado,
  disponibilidadPiscina,
  actualizarInvitados,
  cancelarReserva,
};
