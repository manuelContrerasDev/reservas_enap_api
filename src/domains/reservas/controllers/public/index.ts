// ============================================================
// Controllers — Reservas (PUBLIC / USER)
// ============================================================

import { crearReserva } from "./crear-reserva.controller";
import { misReservas } from "./mis-reservas.controller";
import { detalleReserva } from "./detalle-reserva.controller";
import { cancelarReserva } from "./cancelar-reserva.controller";
import { actualizarInvitados } from "./actualizar-invitados.controller";
import { disponibilidadPiscina } from "./disponibilidad-piscina.controller";

// 👇 viene desde shared
import { subirComprobante } from "../shared/subirComprobante.controller";

/* ============================================================
 * Re-exports individuales (útiles para tests / imports directos)
 * ============================================================ */
export {
  crearReserva,
  misReservas,
  detalleReserva,
  cancelarReserva,
  actualizarInvitados,
  disponibilidadPiscina,
  subirComprobante,
};

/* ============================================================
 * Aggregate Controller (para routes)
 * ============================================================ */
export const ReservasController = {
  /* ============================
   * 👤 USER / PUBLIC
   * ============================ */
  crearReserva,
  misReservas,
  detalleReserva,
  cancelarReserva,
  subirComprobante,

  /* ============================
   * 👥 INVITADOS (USER)
   * ============================ */
  actualizarInvitados,

  /* ============================
   * 📦 DISPONIBILIDAD
   * ============================ */
  disponibilidadPiscina,
};
