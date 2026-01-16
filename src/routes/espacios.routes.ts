import { Router } from "express";
import { EspaciosController } from "@/domains/espacios/controllers/index";

import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";
import { asyncHandler } from "@/middlewares/asyncHandler";

import { validate } from "@/middlewares/validate";
import { validateQuery } from "@/middlewares/validateQuery";
import { validateParams } from "@/middlewares/validateParams";

import {
  crearEspacioSchema,
  actualizarEspacioSchema,
  catalogoQuerySchema,
  espacioIdSchema,
  toggleEspacioSchema,

  // ✅ nuevos
  tipoEspacioSchema,
  disponibilidadRangoSchema,
} from "@/domains/espacios/validators/";

const router = Router();

/* ============================================================
 * 🛠 ADMIN — LISTAR ESPACIOS
 * ============================================================ */
router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(EspaciosController.adminList)
);

/* ============================================================
 * 🧩 CATÁLOGO AGRUPADO (PRODUCTOS) — NUEVO
 * ============================================================ */
router.get(
  "/productos",
  asyncHandler(EspaciosController.catalogoProductos)
);

/* ============================================================
 * 📅 DISPONIBILIDAD POR PRODUCTO (AGRUPADO) — NUEVO
 * /productos/:tipo/disponibilidad?fechaInicio&fechaFin
 * ============================================================ */
router.get(
  "/productos/:tipo/disponibilidad",
  validateParams(tipoEspacioSchema),
  validateQuery(disponibilidadRangoSchema),
  asyncHandler(EspaciosController.catalogoProductosDisponibilidad)
);

/* ============================================================
 * 📌 CATÁLOGO PÚBLICO (LEGACY / POR UNIDAD)
 * ============================================================ */
router.get(
  "/",
  validateQuery(catalogoQuerySchema),
  asyncHandler(EspaciosController.catalogo)
);

/* ============================================================
 * 📅 DISPONIBILIDAD POR UNIDAD (LEGACY)
 * ============================================================ */
router.get(
  "/:id/disponibilidad",
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.disponibilidad)
);

/* ============================================================
 * 📄 DETALLE INDIVIDUAL (LEGACY)
 * ============================================================ */
router.get(
  "/:id",
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.detalle)
);

/* ============================================================
 * 🛠 ADMIN — CREAR
 * ============================================================ */
router.post(
  "/",
  authGuard,
  roleGuard(["ADMIN"]),
  validate(crearEspacioSchema),
  asyncHandler(EspaciosController.crear)
);

/* ============================================================
 * 🛠 ADMIN — ACTUALIZAR
 * ============================================================ */
router.put(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(espacioIdSchema),
  validate(actualizarEspacioSchema),
  asyncHandler(EspaciosController.actualizar)
);

/* ============================================================
 * ❗ ADMIN — ELIMINAR
 * ============================================================ */
router.delete(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.eliminar)
);

/* ============================================================
 * 🔄 ADMIN — TOGGLE ACTIVO
 * ============================================================ */
router.patch(
  "/:id/toggle",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(toggleEspacioSchema),
  asyncHandler(EspaciosController.toggleActivo)
);

export default router;
