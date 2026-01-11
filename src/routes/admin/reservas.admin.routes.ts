import { Router } from "express";
import { Role } from "@prisma/client";

import { ReservasAdminController } from "../../controllers/reservas/admin";
import { cancelarReservaAdmin } from "../../controllers/reservas/admin/cancelar-admin.controller";

import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { validateParams } from "../../middlewares/validateParams";
import { validate } from "../../middlewares/validate";

import { idParamSchema } from "../../validators/common/id-param.schema";
import { cancelarReservaAdminSchema } from "../../validators/reservas/cancelar-reserva-admin.schema";

const router = Router();

/**
 * 🚨 SOLO ADMIN puede crear reservas manuales
 * POST /api/admin/reservas/crear
 */
router.post(
  "/crear",
  authGuard,
  roleGuard([Role.ADMIN]),
  asyncHandler(ReservasAdminController.crearReservaManualAdmin)
);

/**
 * 🚫 Cancelar reserva (ADMIN)
 * PATCH /api/admin/reservas/:id/cancelar
 * - Solo cancela PENDIENTE_PAGO
 * - motivo opcional
 */
router.patch(
  "/:id/cancelar",
  authGuard,
  roleGuard([Role.ADMIN]),
  validateParams(idParamSchema),
  validate(cancelarReservaAdminSchema),
  asyncHandler(cancelarReservaAdmin)
);

export default router;
