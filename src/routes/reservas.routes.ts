// ============================================================
// reservas.routes.ts — ENAP 2026 (USER / ADMIN / SHARED)
// Base: /api/reservas
// ============================================================

import { Router } from "express";
import { ReservasController } from "@/domains/reservas/controllers";
import { ReservasAdminController } from "@/domains/reservas/controllers/admin";

import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";
import { asyncHandler } from "@/middlewares/asyncHandler";

import { validate } from "@/middlewares/validate";
import { validateQuery } from "@/middlewares/validateQuery";
import { validateParams } from "@/middlewares/validateParams";

// =======================
// Schemas
// =======================
import { crearReservaSchema } from "@/domains/reservas/validators/crear-reserva.schema";
import { piscinaFechaSchema } from "@/domains/reservas/validators/piscina-fecha.schema";

import { misReservasQuerySchema } from "@/domains/reservas/validators/mis-reservas.schema";
import { subirComprobanteSchema } from "@/domains/reservas/validators/subir-comprobante.schema";

import { adminConfirmarReservaSchema } from "@/domains/reservas/validators/admin-confirmar-reserva.schema";
import { aprobarPagoSchema } from "@/domains/reservas/validators/aprobar-pago.schema";
import { rechazarPagoSchema } from "@/domains/reservas/validators/rechazar-pago.schema";

import { actualizarInvitadosSchema } from "@/domains/reservas/validators/actualizar-invitados.schema";
import { editReservaSchema } from "@/domains/reservas/validators/edit-reserva.schema";
import { actualizarEstadoReservaSchema } from "@/domains/reservas/validators";

import { idParamSchema } from "@/shared/validators/common/id-param.schema";

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
  validateQuery(misReservasQuerySchema),
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
 * 📦 OPERACIONES COMPARTIDAS (USER / ADMIN)
 * ============================================================ */

/**
 * Subir comprobante (USER o ADMIN)
 * PATCH /api/reservas/:id/comprobante
 */
router.patch(
  "/:id/comprobante",
  authGuard,
  validateParams(idParamSchema),
  validate(subirComprobanteSchema),
  asyncHandler(ReservasController.subirComprobante)
);

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

/* ============================================================
 * 🛠️ ADMIN
 * ============================================================ */

/**
 * Listado admin
 * GET /api/reservas/admin
 */
router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(ReservasAdminController.obtenerReservasAdmin)
);

/**
 * Crear reserva manual (ADMIN)
 * POST /api/reservas/admin/manual
 */
router.post(
  "/admin/manual",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(ReservasAdminController.crearReservaManualAdmin)
);

/**
 * Editar reserva (ADMIN)
 * PATCH /api/reservas/admin/:id
 */
router.patch(
  "/admin/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(editReservaSchema),
  asyncHandler(ReservasAdminController.editarReservaAdmin)
);

/**
 * Agregar invitados (ADMIN)
 * PATCH /api/reservas/admin/:id/invitados
 */
router.patch(
  "/admin/:id/invitados",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarInvitadosSchema),
  asyncHandler(ReservasAdminController.agregarInvitadosAdmin)
);

/**
 * Aprobar pago (ADMIN)
 * PATCH /api/reservas/admin/:id/aprobar
 */
router.patch(
  "/admin/:id/aprobar",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(aprobarPagoSchema),
  asyncHandler(ReservasAdminController.aprobarPagoAdmin)
);

/**
 * Rechazar pago (ADMIN)
 * PATCH /api/reservas/admin/:id/rechazar
 */
router.patch(
  "/admin/:id/rechazar",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(rechazarPagoSchema),
  asyncHandler(ReservasAdminController.rechazarPagoAdmin)
);

/**
 * Confirmar reserva (ADMIN)
 * PATCH /api/reservas/admin/:id/confirmar-reserva
 */
router.patch(
  "/admin/:id/confirmar-reserva",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(adminConfirmarReservaSchema),
  asyncHandler(ReservasAdminController.confirmarReservaAdmin)
);

/**
 * Cambiar estado (ADMIN) — genérico
 * PATCH /api/reservas/admin/:id/estado
 */
router.patch(
  "/admin/:id/estado",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarEstadoReservaSchema),
  asyncHandler(ReservasAdminController.actualizarEstadoAdmin)
);

/* ============================================================
 * 📄 DETALLE (USER / ADMIN)
 * ⚠️ SIEMPRE AL FINAL
 * ============================================================ */
router.get(
  "/:id",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.detalleReserva)
);

export default router;
