// src/routes/audit.routes.ts
import { Router } from "express";
import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";

import { listarAuditLogsController } from "@/domains/audit/controllers/listar-audit-logs.controller";
import { auditMetaController } from "@/domains/audit/controllers/audit-meta.controller";

const router = Router();

/**
 * 🔐 AUDIT — ADMIN
 */
router.get(
  "/admin/audit-logs",
  authGuard,
  roleGuard(["ADMIN"]),
  listarAuditLogsController
);

/**
 * 🔐 AUDIT META — acciones válidas (frontend admin)
 */
router.get(
  "/admin/audit-meta/actions",
  authGuard,
  roleGuard(["ADMIN"]),
  auditMetaController
);

export default router;
