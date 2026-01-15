// src/routes/tesoreria.routes.ts
import { Router } from "express";
import { Role } from "@prisma/client";

import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";

import { listarMovimientosTesoreriaController } from "@/controllers/tesoreria/admin/listar-movimientos.controller";
import { resumenTesoreriaController } from "@/controllers/tesoreria/admin/resumen-tesoreria.controller";
import { exportarMovimientosXlsxController } from "@/controllers/tesoreria/admin/exportar-movimientos-xlsx.controller";

const router = Router();

// 🔐 ADMIN TESORERÍA
router.get(
  "/admin/tesoreria/movimientos",
  authGuard,
  roleGuard([Role.ADMIN]),
  listarMovimientosTesoreriaController
);

router.get(
  "/admin/tesoreria/resumen",
  authGuard,
  roleGuard([Role.ADMIN]),
  resumenTesoreriaController
);

router.get(
  "/admin/tesoreria/movimientos/export",
  authGuard,
  roleGuard([Role.ADMIN]),
  exportarMovimientosXlsxController
);

export default router;
