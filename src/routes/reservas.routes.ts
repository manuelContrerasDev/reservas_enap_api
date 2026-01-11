// ============================================================
// reservas.routes.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { Router } from "express";
import { ReservasController } from "../controllers/reservas";

import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { asyncHandler } from "../middlewares/asyncHandler";

import { validate } from "../middlewares/validate";
import { validateQuery } from "../middlewares/validateQuery";
import { validateParams } from "../middlewares/validateParams";

// Schemas
import { crearReservaSchema } from "../validators/reservas/crear-reserva.schema";
import { piscinaFechaSchema } from "../validators/reservas/piscina-fecha.schema";
import { actualizarEstadoSchema } from "../validators/reservas/actualizar-estado-reserva.schema";
import { idParamSchema } from "../validators/common/id-param.schema";
import { actualizarInvitadosSchema } from "../validators/reservas/actualizar-invitados.schema";
import { editReservaSchema } from "../validators/reservas/edit-reserva.schema";

const router = Router();

/* ============================================================
 * 📅 RESERVAS — API ENAP
 * Base: /api/reservas
 * ============================================================ */

/* ------------------------------------------------------------
 * CREAR RESERVA (USER)
 * POST /api/reservas
 * ------------------------------------------------------------ */
router.post(
  "/",
  authGuard,
  validate(crearReservaSchema),
  asyncHandler(ReservasController.crearReserva)
);

/* ------------------------------------------------------------
 * MIS RESERVAS (SOCIO / EXTERNO)
 * GET /api/reservas/mis-reservas
 * ------------------------------------------------------------ */
router.get(
  "/mis-reservas",
  authGuard,
  asyncHandler(ReservasController.misReservas)
);

/* ------------------------------------------------------------
 * LISTADO GENERAL (ADMIN)
 * GET /api/reservas/admin
 * ------------------------------------------------------------ */
router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(ReservasController.obtenerReservasAdmin)
);

/* ------------------------------------------------------------
 * DISPONIBILIDAD PISCINA
 * GET /api/reservas/piscina/disponibilidad
 * ------------------------------------------------------------ */
router.get(
  "/piscina/disponibilidad",
  authGuard, // recomendado
  validateQuery(piscinaFechaSchema),
  asyncHandler(ReservasController.disponibilidadPiscina)
);

/* ------------------------------------------------------------
 * EDITAR RESERVA (ADMIN)
 * PATCH /api/reservas/:id
 * ------------------------------------------------------------ */
router.patch(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(editReservaSchema),
  asyncHandler(ReservasController.editarReserva)
);

/* ------------------------------------------------------------
 * EDITAR INVITADOS (ADMIN)
 * PATCH /api/reservas/:id/invitados
 * ------------------------------------------------------------ */
router.patch(
  "/:id/invitados",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarInvitadosSchema),
  asyncHandler(ReservasController.actualizarInvitados)
);

/* ------------------------------------------------------------
 * CANCELAR RESERVA (USER)
 * PATCH /api/reservas/:id/cancelacion
 * ------------------------------------------------------------ */
router.patch(
  "/:id/cancelacion",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.cancelarReserva)
);

/* ------------------------------------------------------------
 * CAMBIAR ESTADO (ADMIN)
 * PATCH /api/reservas/:id/estado
 * ------------------------------------------------------------ */
router.patch(
  "/:id/estado",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarEstadoSchema),
  asyncHandler(ReservasController.actualizarEstado)
);

/* ------------------------------------------------------------
 * ELIMINAR RESERVA (ADMIN)
 * DELETE /api/reservas/:id
 * ------------------------------------------------------------ */
router.delete(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  asyncHandler(ReservasController.eliminarReservaAdmin)
);

/* ------------------------------------------------------------
 * OBTENER DETALLE RESERVA (USER / ADMIN)
 * ⚠️ DEJAR SIEMPRE AL FINAL
 * GET /api/reservas/:id
 * ------------------------------------------------------------ */
router.get(
  "/:id",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.detalleReserva)
);

export default router;
