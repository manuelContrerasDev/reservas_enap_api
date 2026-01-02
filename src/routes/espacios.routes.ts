import { Router } from "express";
import { EspaciosController } from "../controllers/espacios";

import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { asyncHandler } from "../middlewares/asyncHandler";

import { validate } from "../middlewares/validate";
import { validateQuery } from "../middlewares/validateQuery";
import { validateParams } from "../middlewares/validateParams";

// ⬅️ NUEVOS SCHEMAS
import {
  crearEspacioSchema,
  actualizarEspacioSchema,
  catalogoQuerySchema,
  espacioIdSchema,
  toggleEspacioSchema,
} from "../validators/espacios";

const router = Router();

/* ============================================================
 * 🛠 ADMIN — LISTAR ESPACIOS (DEBE IR ANTES DE /:id)
 * ============================================================*/
router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(EspaciosController.adminList)
);

/* ============================================================
 * 📌 CATÁLOGO PÚBLICO
 * ============================================================*/
router.get(
  "/",
  validateQuery(catalogoQuerySchema),
  asyncHandler(EspaciosController.catalogo)
);

/* ============================================================
 * 📅 DISPONIBILIDAD
 * ============================================================*/
router.get(
  "/:id/disponibilidad",
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.disponibilidad)
);

/* ============================================================
 * 📄 DETALLE
 * ============================================================*/
router.get(
  "/:id",
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.detalle)
);

/* ============================================================
 * 🛠 ADMIN — CREAR ESPACIO
 * ============================================================*/
router.post(
  "/",
  authGuard,
  roleGuard(["ADMIN"]),
  validate(crearEspacioSchema),
  asyncHandler(EspaciosController.crear)
);

/* ============================================================
 * 🛠 ADMIN — ACTUALIZAR
 * ============================================================*/
router.put(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(espacioIdSchema),
  validate(actualizarEspacioSchema),
  asyncHandler(EspaciosController.actualizar)
);

/* ============================================================
 * ❗ ADMIN — ELIMINACIÓN REAL
 * ============================================================*/
router.delete(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(espacioIdSchema),
  asyncHandler(EspaciosController.eliminar)
);

/* ============================================================
 * 🔄 ADMIN — TOGGLE ACTIVO (SOFT)
 * ============================================================*/
router.patch(
  "/:id/toggle",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(toggleEspacioSchema),
  asyncHandler(EspaciosController.toggleActivo)
);

export default router;
