// src/routes/admin/reservas.admin.routes.ts
import { Router } from "express";
import { Role } from "@prisma/client";

import { ReservasAdminController } from "@/domains/reservas/controllers/admin";
import { subirComprobante } from "@/domains/reservas/controllers/subirComprobante.controller";
import { agregarInvitadosAdmin } from "@/domains/reservas/controllers/admin/agregar-invitados.controller";

import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { validateParams } from "@/middlewares/validateParams";
import { validate } from "@/middlewares/validate";

import { idParamSchema } from "@/shared/validators/common/id-param.schema";
import { cancelarReservaAdminSchema } from "@/domains/reservas/validators/cancelar-reserva-admin.schema";

const router = Router();

/* ============================================================
 * 📋 LISTADO ADMIN
 * ============================================================ */
router.get(
  "/",
  authGuard,
  roleGuard([Role.ADMIN]),
  asyncHandler(ReservasAdminController.obtenerReservasAdmin)
);

/* ============================================================
 * ✏️ CREAR RESERVA MANUAL
 * ============================================================ */
router.post(
  "/crear",
  authGuard,
  roleGuard([Role.ADMIN]),
  asyncHandler(ReservasAdminController.crearReservaManualAdmin)
);

/* ============================================================
 * 📎 SUBIR COMPROBANTE
 * ============================================================ */
router.patch(
  "/:id/comprobante",
  authGuard,
  roleGuard([Role.ADMIN]),
  validateParams(idParamSchema),
  asyncHandler(subirComprobante)
);

/* ============================================================
 * 💰 CONFIRMAR / RECHAZAR / CANCELAR
 * ============================================================ */
router.patch(
  "/:id/confirmar",
  authGuard,
  roleGuard([Role.ADMIN]),
  validateParams(idParamSchema),
  asyncHandler(ReservasAdminController.aprobarPagoAdmin)
);

router.patch(
  "/:id/rechazar",
  authGuard,
  roleGuard([Role.ADMIN]),
  validateParams(idParamSchema),
  asyncHandler(ReservasAdminController.rechazarPagoAdmin)
);

router.patch(
  "/:id/cancelar",
  authGuard,
  roleGuard([Role.ADMIN]),
  validateParams(idParamSchema),
  validate(cancelarReservaAdminSchema),
  asyncHandler(ReservasAdminController.cancelarReservaAdmin)
);

/* ============================================================
 * 👥 INVITADOS (ADMIN · RESERVA MANUAL)
 * ============================================================ */
router.post(
  "/:id/invitados",
  authGuard,
  roleGuard([Role.ADMIN]),
  validateParams(idParamSchema),
  asyncHandler(agregarInvitadosAdmin)
);

export default router;
