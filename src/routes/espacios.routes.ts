import { Router } from "express";

import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { validate } from "@/middlewares/validate";
import { validateQuery } from "@/middlewares/validateQuery";
import { validateParams } from "@/middlewares/validateParams";

// ============================================================
// 📦 CONTRATO ESPACIOS — PÚBLICO (OFICIAL v1.1)
// ============================================================

import {
  catalogoContratoController,
} from "@/domains/espacios/contrato/controllers/catalogo.controller";

import {
  detalleContratoController,
} from "@/domains/espacios/contrato/controllers/detalle.controller";

import {
  catalogoContratoQuerySchema,
} from "@/domains/espacios/contrato/validators/catalogo-query.schema";

import {
  detalleContratoQuerySchema,
} from "@/domains/espacios/contrato/validators/detalle-query.schema";

import {
  tipoEspacioSchema,
} from "@/domains/espacios/validators";

// ============================================================
// 🛠️ CONTRATO ESPACIOS — ADMIN
// ============================================================

import {
  seedEspacioTipoConfigController,
} from "@/domains/espacios/contrato/admin/controllers/seed-config.controller";

import {
  patchEspacioTipoConfigController,
} from "@/domains/espacios/contrato/admin/controllers/patch-config.controller";

import {
  patchVisibilidadController,
} from "@/domains/espacios/contrato/admin/controllers/patch-visibilidad.controller";

import {
  deleteEspacioTipoConfigController,
} from "@/domains/espacios/contrato/admin/controllers/delete-config.controller";

// ============================================================
// ⚠️ LEGACY (NO USAR EN NUEVO FRONTEND)
// ============================================================

import { EspaciosController } from "@/domains/espacios/controllers";

import {
  crearEspacioSchema,
  actualizarEspacioSchema,
  catalogoQuerySchema,
  espacioIdSchema,
  toggleEspacioSchema,
  disponibilidadRangoSchema,
} from "@/domains/espacios/validators";

const router = Router();

/* ============================================================
 * 🌐 PÚBLICO — CONTRATO ESPACIOS
 * ============================================================ */

router.get(
  "/catalogo",
  validateQuery(catalogoContratoQuerySchema),
  asyncHandler(catalogoContratoController)
);

router.get(
  "/:tipo/detalle",
  validateParams(tipoEspacioSchema),
  validateQuery(detalleContratoQuerySchema),
  asyncHandler(detalleContratoController)
);

/* ============================================================
 * 🔐 ADMIN — CONFIGURACIÓN CATÁLOGO (CONTRATO)
 * ============================================================ */

router.post(
  "/admin/espacios/config",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(seedEspacioTipoConfigController)
);

router.patch(
  "/admin/espacios/config/:tipo",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(patchEspacioTipoConfigController)
);

router.patch(
  "/admin/espacios/config/:tipo/visibilidad",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(patchVisibilidadController)
);

router.delete(
  "/admin/espacios/config/:tipo",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(deleteEspacioTipoConfigController)
);

/* ============================================================
 * 🧟 LEGACY — ESPACIOS (NO USAR EN NUEVOS FLUJOS)
 * ============================================================ */

router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(EspaciosController.adminList)
);

router.get(
  "/productos",
  asyncHandler(EspaciosController.catalogoProductos)
);

router.get(
  "/productos/:tipo/disponibilidad",
  validateParams(tipoEspacioSchema),
  validateQuery(disponibilidadRangoSchema),
  asyncHandler(EspaciosController.catalogoProductosDisponibilidad)
);

router.get(
  "/",
  validateQuery(catalogoQuerySchema),
  asyncHandler(EspaciosController.catalogo)
);

router.get(
  "/:id/disponibilidad",
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.disponibilidad)
);

router.get(
  "/:id",
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.detalle)
);

router.post(
  "/",
  authGuard,
  roleGuard(["ADMIN"]),
  validate(crearEspacioSchema),
  asyncHandler(EspaciosController.crear)
);

router.put(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(espacioIdSchema),
  validate(actualizarEspacioSchema),
  asyncHandler(EspaciosController.actualizar)
);

router.delete(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.eliminar)
);

router.patch(
  "/:id/toggle",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(toggleEspacioSchema),
  asyncHandler(EspaciosController.toggleActivo)
);

export default router;
