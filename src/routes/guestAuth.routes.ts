// src/routes/guestAuth.routes.ts
import { Router } from "express";
import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validate } from "../middlewares/validate";

import {
  createGuestAuthSchema,
  deleteGuestAuthSchema,
} from "../validators/guestAuth.schema";

import { GuestAuthController } from "../controllers/guestAuth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: GuestAuth
 *   description: Gestión de invitados autorizados por socios
 */

/**
 * @swagger
 * /api/guest-auth:
 *   post:
 *     summary: Autorizar a un invitado
 *     description: Permite que un socio autorice a un invitado a usar el sistema y realizar reservas en su nombre.
 *     tags: [GuestAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: invitado@correo.com
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *     responses:
 *       201:
 *         description: Invitado autorizado correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Solo los SOCIOS pueden autorizar invitados
 */
router.post(
  "/",
  authGuard,
  roleGuard(["SOCIO"]),
  validate(createGuestAuthSchema),
  asyncHandler(GuestAuthController.crear)
);

/**
 * @swagger
 * /api/guest-auth/mios:
 *   get:
 *     summary: Listar invitados autorizados del socio
 *     tags: [GuestAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitados autorizados
 *       403:
 *         description: Solo un SOCIO puede ver sus autorizaciones
 */
router.get(
  "/mios",
  authGuard,
  roleGuard(["SOCIO"]),
  asyncHandler(GuestAuthController.mios)
);

/**
 * @swagger
 * /api/guest-auth/{id}:
 *   delete:
 *     summary: Revocar autorización de un invitado
 *     tags: [GuestAuth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la autorización a eliminar
 *     responses:
 *       200:
 *         description: Autorización eliminada correctamente
 *       404:
 *         description: Autorización no encontrada
 *       403:
 *         description: No autorizado a eliminar esta autorización
 */
router.delete(
  "/:id",
  authGuard,
  roleGuard(["SOCIO"]),
  validate(deleteGuestAuthSchema),
  asyncHandler(GuestAuthController.eliminar)
);

export default router;
