// src/controllers/reservas/index.ts

import { crearReserva } from "./crear-reserva.controller";
import { misReservas } from "./mis-reservas.controller";
import { cancelarReserva } from "./cancelar-reserva.controller";
import { detalleReserva } from "./detalle-reserva.controller";
import { actualizarEstado } from "./actualizar-estado.controller";
import { disponibilidadPiscina } from "./disponibilidad-piscina.controller";
import { actualizarInvitados } from "./actualizar-invitados.controller";
import { editarReserva } from "./editar-reserva.controller";

export const ReservasController = {
  // 👤 USER / SHARED
  crearReserva,
  misReservas,
  cancelarReserva,
  detalleReserva,

  // ⚠️ LEGACY / TRANSICIÓN
  actualizarEstado,

  // 📦 OPERACIONES
  disponibilidadPiscina,
  actualizarInvitados,
  editarReserva,
};
