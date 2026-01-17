// ============================================================
// Controllers — Reservas (ROOT AGGREGATOR)
// ============================================================

// 🔹 PUBLIC
import {
  crearReserva,
  misReservas,
  detalleReserva,
  cancelarReserva,
  actualizarInvitados,
  disponibilidadPiscina,
} from "./public";

import { subirComprobante } from "./shared/subirComprobante.controller";

// ============================================================
// Export facade para routes
// ============================================================

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
