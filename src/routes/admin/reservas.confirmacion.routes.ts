// src/routes/admin/reservas.confirmacion.routes.ts
import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Role } from "@prisma/client";

import { subirComprobante } from "../../controllers/reservas/subirComprobante.controller";
import { confirmarReservaManual } from "../../controllers/reservas/confirmarReservaManual.controller";

const router = Router();

// Subir comprobante (admin)
router.patch(
  "/:id/comprobante",
  authGuard,
  roleGuard([Role.ADMIN]),
  asyncHandler(subirComprobante)
);

// Confirmar reserva manual
router.patch(
  "/:id/confirmar",
  authGuard,
  roleGuard([Role.ADMIN]),
  asyncHandler(confirmarReservaManual)
);

export default router;
