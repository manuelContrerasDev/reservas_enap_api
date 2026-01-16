// ============================================================
// reservas.routes.ts — ENAP 2025 (USER / SHARED)
// Base: /api/reservas
// ============================================================

import { Router } from "express";
import { ReservasController } from "@/domains/reservas/controllers";

import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";
import { asyncHandler } from "@/middlewares/asyncHandler";

import { validate } from "@/middlewares/validate";
import { validateQuery } from "@/middlewares/validateQuery";
import { validateParams } from "@/middlewares/validateParams";

// Schemas
import { crearReservaSchema } from "@/domains/reservas/validators/crear-reserva.schema";
import { piscinaFechaSchema } from "@/domains/reservas/validators/piscina-fecha.schema";
import { actualizarEstadoSchema } from "@/domains/reservas/validators/actualizar-estado-reserva.schema";
import { idParamSchema } from "@/shared/validators/common/id-param.schema";
import { actualizarInvitadosSchema } from "../domains/reservas/validators/actualizar-invitados.schema";
import { editReservaSchema } from "../domains/reservas/validators/edit-reserva.schema";

const router = Router();

/* ============================================================
 * 👤 USER / SOCIO / EXTERNO
 * ============================================================ */

/**
 * Crear reserva
 * POST /api/reservas
 */
router.post(
  "/",
  authGuard,
  validate(crearReservaSchema),
  asyncHandler(ReservasController.crearReserva)
);

/**
 * Mis reservas
 * GET /api/reservas/mis-reservas
 */
router.get(
  "/mis-reservas",
  authGuard,
  asyncHandler(ReservasController.misReservas)
);

/**
 * Cancelar reserva (USER)
 * PATCH /api/reservas/:id/cancelacion
 */
router.patch(
  "/:id/cancelacion",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.cancelarReserva)
);

/* ============================================================
 * 📦 OPERACIONES COMPARTIDAS
 * ============================================================ */

/**
 * Disponibilidad piscina
 * GET /api/reservas/piscina/disponibilidad
 */
router.get(
  "/piscina/disponibilidad",
  authGuard,
  validateQuery(piscinaFechaSchema),
  asyncHandler(ReservasController.disponibilidadPiscina)
);

/**
 * Editar reserva (ADMIN)
 * PATCH /api/reservas/:id
 */
router.patch(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(editReservaSchema),
  asyncHandler(ReservasController.editarReserva)
);

/**
 * Editar invitados (ADMIN)
 * PATCH /api/reservas/:id/invitados
 */
router.patch(
  "/:id/invitados",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarInvitadosSchema),
  asyncHandler(ReservasController.actualizarInvitados)
);

/* ============================================================
 * ⚠️ LEGACY — CAMBIO DE ESTADO GENÉRICO
 * NO usar desde Admin UI
 * ============================================================ */
router.patch(
  "/:id/estado",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarEstadoSchema),
  asyncHandler(ReservasController.actualizarEstado)
);

/**
 * Detalle reserva (USER / ADMIN)
 * ⚠️ SIEMPRE AL FINAL
 */
router.get(
  "/:id",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.detalleReserva)
);

export default router;
