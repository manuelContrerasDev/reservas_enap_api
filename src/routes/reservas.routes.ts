import { Router } from "express";
import { ReservasController } from "../controllers/reservas";

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
import { actualizarEstadoSchema } from "../validators/reservas/actualizar-estado-reserva.schema";
import { idParamSchema } from "../validators/common/id-param.schema";
import { actualizarInvitadosSchema } from "../validators/reservas/actualizar-invitados.schema";
import { editReservaSchema } from "../validators/reservas/edit-reserva.schema";

const router = Router();

/* ============================================================
 * 📅 RESERVAS — API ENAP
 * Base: /api/reservas
 * ============================================================ */

/* ------------------------------------------------------------
 * CREAR RESERVA
 * ------------------------------------------------------------ */
router.post(
  "/crear",
  authGuard,
  validate(crearReservaSchema),
  asyncHandler(ReservasController.crearReserva)
);

/* ------------------------------------------------------------
 * DISPONIBILIDAD PISCINA
 * ------------------------------------------------------------ */
router.get(
  "/piscina/disponibilidad",
  authGuard,
  validateQuery(piscinaFechaSchema),
  asyncHandler(ReservasController.disponibilidadPiscina)
);

/* ------------------------------------------------------------
 * MIS RESERVAS (SOCIO / EXTERNO)
 * ------------------------------------------------------------ */
router.get(
  "/mias",
  authGuard,
  asyncHandler(ReservasController.misReservas)
);

/* ------------------------------------------------------------
 * LISTADO GENERAL (ADMIN / fallback a propias)
 * ------------------------------------------------------------ */
router.get(
  "/",
  authGuard,
  asyncHandler(async (req, res) => {
    if (req.user?.role === "ADMIN") {
      return ReservasController.obtenerReservasAdmin(req, res);
    }
    return ReservasController.misReservas(req, res);
  })
);

/* ------------------------------------------------------------
 * EDITAR RESERVA (DATOS, NO FECHAS, NO MONTO)
 * ------------------------------------------------------------ */
/**
 * @openapi
 * /api/reservas/{id}:
 *   patch:
 *     tags:
 *       - Reservas
 *     summary: Editar datos administrativos de una reserva
 *     description: >
 *       Permite editar datos del socio, responsable y uso de la reserva.
 *       No permite modificar fechas, cantidades ni montos.
 */
router.patch(
  "/:id",
  authGuard,
  validateParams(idParamSchema),
  validate(editReservaSchema),
  asyncHandler(ReservasController.editarReserva)
);


/* ------------------------------------------------------------
 * EDITAR INVITADOS
 * ------------------------------------------------------------ */
router.patch(
  "/:id/invitados",
  authGuard,
  validateParams(idParamSchema),
  validate(actualizarInvitadosSchema),
  asyncHandler(ReservasController.actualizarInvitados)
);

/* ------------------------------------------------------------
 * CANCELAR RESERVA
 * ------------------------------------------------------------ */
router.patch(
  "/:id/cancelar",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.cancelarReserva)
);

/* ------------------------------------------------------------
 * CAMBIAR ESTADO (ADMIN)
 * ------------------------------------------------------------ */
router.patch(
  "/:id/estado",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  validate(actualizarEstadoSchema),
  asyncHandler(ReservasController.actualizarEstado)
);

/* ------------------------------------------------------------
 * ELIMINAR RESERVA (ADMIN)
 * ------------------------------------------------------------ */
router.delete(
  "/admin/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  validateParams(idParamSchema),
  asyncHandler(ReservasController.eliminarReservaAdmin)
);

/* ------------------------------------------------------------
 * OBTENER DETALLE (SIEMPRE AL FINAL)
 * ------------------------------------------------------------ */
router.get(
  "/:id",
  authGuard,
  validateParams(idParamSchema),
  asyncHandler(ReservasController.obtener)
);

export default router;
