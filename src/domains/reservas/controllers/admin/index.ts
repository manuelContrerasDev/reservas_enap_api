// src/domains/reservas/controllers/admin/index.ts

import { obtenerReservasAdmin } from "./obtener-list-admin.controller";
import { crearReservaManualAdmin } from "./crear-manual.controller";

import { editarReservaAdmin } from "./editar-reserva-admin.controller";
import { agregarInvitadosAdmin } from "./agregar-invitados.controller";
import { actualizarEstadoAdmin } from "./actualizar-estado.controller";

import { aprobarPagoAdmin } from "./aprobar-pago.controller";
import { rechazarPagoAdmin } from "./rechazar-pago.controller";
import { confirmarReservaAdmin } from "./confirmar-reserva-admin.controller";

import { cancelarReservaAdmin } from "./cancelar-reserva-admin.controller";
import { searchUsers } from "./obtener-users.controller";

export const ReservasAdminController = {
  /* ============================
   * 📋 LISTADO
   * ============================ */
  obtenerReservasAdmin,

  /* ============================
   * ✏️ CREACIÓN / EDICIÓN TOTAL
   * ============================ */
  crearReservaManualAdmin,
  editarReservaAdmin,

  /* ============================
   * 👥 INVITADOS (ADMIN)
   * ============================ */
  agregarInvitadosAdmin,

  /* ============================
   * 💰 PAGOS
   * ============================ */
  aprobarPagoAdmin,
  rechazarPagoAdmin,
  confirmarReservaAdmin,

  /* ============================
   * 🚫 CANCELACIÓN
   * ============================ */
  cancelarReservaAdmin,

  /* ============================
   * 👤 USUARIOS
   * ============================ */
  searchUsers,
};
