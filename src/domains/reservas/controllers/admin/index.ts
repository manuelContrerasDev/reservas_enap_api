// src/controllers/reservas/admin/index.ts

import { crearReservaManualAdmin } from "./crear-manual.controller";
import { obtenerReservasAdmin } from "./admin-list.controller";

import { aprobarPagoAdmin } from "./aprobar-pago.controller";
import { rechazarPagoAdmin } from "./rechazar-pago.controller";
import { cancelarReservaAdmin } from "./cancelar-admin.controller";

export const ReservasAdminController = {
  // 📋 Listado
  obtenerReservasAdmin,

  // ✏️ Creación manual
  crearReservaManualAdmin,

  // 💰 Flujo financiero
  aprobarPagoAdmin,
  rechazarPagoAdmin,

  // 🚫 Cancelación controlada
  cancelarReservaAdmin,

};
