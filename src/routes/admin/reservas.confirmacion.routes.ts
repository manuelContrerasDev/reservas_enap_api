// src/routes/admin/reservas.confirmacion.routes.ts
import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Role } from "@prisma/client";

import { subirComprobante } from "../../domains/reservas/controllers/shared/subirComprobante.controller";

const router = Router();

// Subir comprobante (admin)
router.patch(
  "/:id/comprobante",
  authGuard,
  roleGuard([Role.ADMIN]),
  asyncHandler(subirComprobante)
);

export default router;
