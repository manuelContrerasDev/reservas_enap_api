import { Router } from "express";

import { ReservasController } from "../controllers/reservas/reservas.controller";

import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { asyncHandler } from "../middlewares/asyncHandler";

import { validate } from "../middlewares/validate";
import { validateQuery } from "../middlewares/validateQuery";
import { validateParams } from "../middlewares/validateParams";

// Schemas
import { crearReservaSchema } from "../validators/reservas/crear-reserva.schema";
import { piscinaFechaSchema } from "../validators/reservas/piscina-fecha.schema";
import { adminReservasQuerySchema } from "../validators/reservas/filtros-admin.schema";
import { actualizarEstadoSchema } from "../validators/reservas/estado-reserva.schema";
import { idParamSchema } from "../validators/common/id-param.schema";

import { actualizarInvitadosSchema } from "../validators/reservas/actualizar-invitados.schema";


const router = Router();

/* ============================================================
 * 📅 RESERVAS — API ENAP
 * Base: /api/reservas
 * ============================================================ */

/**
 * @openapi
 * /api/reservas:
 *   post:
 *     tags:
 *       - Reservas
 *     summary: Crear una reserva (SOCIO o INVITADO autorizado)
 *     security:
 *       - bearerAuth: []
 *     description: Crea una nueva reserva asociada a un espacio ENAP.
 */
router.post(
  "/",
  authGuard,
  validate(crearReservaSchema),
  asyncHandler(ReservasController.crear)
);

/**
 * @openapi
 * /api/reservas/piscina/disponibilidad:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener disponibilidad de piscina para un día
 */
router.get(
  "/piscina/disponibilidad",
  authGuard,
  validateQuery(piscinaFechaSchema),
  asyncHandler(ReservasController.disponibilidadPiscina)
);

/**
 * @openapi
 * /api/reservas/mias:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Listar reservas del usuario autenticado
 */
router.get(
  "/mias",
  authGuard,
  asyncHandler(ReservasController.mias)
);

/**
 * @openapi
 * /api/reservas/admin:
 *   get:
 *     tags:
 *       - Reservas (Admin)
 *     summary: Listado completo de reservas (ADMIN)
 */
router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  validateQuery(adminReservasQuerySchema),
  asyncHandler(ReservasController.adminList)
);

/**
 * @openapi
 * /api/reservas/{id}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener detalle de una reserva por ID
 */
router.get(
  "/:id",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.obtener)
);

/**
 * @openapi
 * /api/reservas/{id}/estado:
 *   patch:
 *     tags:
 *       - Reservas (Admin)
 *     summary: Cambiar estado de una reserva (ADMIN)
 */
router.patch(
  "/:id/estado",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarEstadoSchema),
  asyncHandler(ReservasController.actualizarEstado)
);

/**
 * @openapi
 * /api/reservas/{id}:
 *   delete:
 *     tags:
 *       - Reservas (Admin)
 *     summary: Eliminar una reserva (ADMIN)
 */
router.delete(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  asyncHandler(ReservasController.eliminar)
);

router.patch(
  "/:id/invitados",
  authGuard,
  validateParams(idParamSchema),
  validate(actualizarInvitadosSchema),
  asyncHandler(ReservasController.actualizarInvitados)
);

export default router;
