// src/routes/admin/reservas.admin.routes.ts
import { Router } from "express";
import { ReservasAdminController } from "../../controllers/reservas/admin";
import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import { Role } from "@prisma/client";

const router = Router();

/**
 * 🚨 SOLO ADMIN puede crear reservas manuales
 * POST /api/admin/reservas/crear
 */
router.post(
  "/crear",
  authGuard,
  roleGuard([Role.ADMIN]),
  ReservasAdminController.crearReservaManualAdmin
);

export default router;
