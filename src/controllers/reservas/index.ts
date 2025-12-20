// src/controllers/reservas/index.ts

import { crearReserva } from "./crear-reserva.controller";
import { misReservas } from "./mis-reservas.controller";
import { cancelarReserva } from "./cancelar-reserva.controller";
import { obtener } from "./obtener.controller";
import { actualizarEstado } from "./actualizar-estado.controller";
import { disponibilidadPiscina } from "./disponibilidad-piscina.controller";
import { actualizarInvitados } from "./actualizar-invitados.controller";
import { editarReserva } from "./editar-reserva.controller";

import { obtenerReservasAdmin } from "../admin/reservas/obtener-reservas.controller";
import { eliminarReservaAdmin } from "../admin/reservas/eliminar-reserva.controller";
import { crearReservaManualAdmin } from "../admin/reservas/crear-manual.controller";

export const ReservasController = {
  crearReservaManualAdmin,
  obtenerReservasAdmin,
  eliminarReservaAdmin,
  editarReserva,
  crearReserva,
  misReservas,
  obtener,
  actualizarEstado,
  disponibilidadPiscina,
  actualizarInvitados,
  cancelarReserva,
};
