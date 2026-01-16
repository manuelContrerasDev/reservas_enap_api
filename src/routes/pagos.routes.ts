import { Router } from "express";
import { PagosController } from "@/domains/pagos/controllers/pagos.controller";
import { authGuard } from "@/middlewares/authGuard";
import { roleGuard } from "@/middlewares/roleGuard";
import { asyncHandler } from "@/middlewares/asyncHandler";

const router = Router();

/* ============================================================
 * 1) Crear intento de pago Webpay
 * ============================================================ */
router.post(
  "/checkout",
  authGuard,
  roleGuard(["SOCIO", "ADMIN"]),
  asyncHandler(PagosController.crear)
);

/* ============================================================
 * 2) Pagos del usuario autenticado
 * ============================================================ */
router.get(
  "/mios",
  authGuard,
  roleGuard(["SOCIO", "ADMIN"]),
  asyncHandler(PagosController.mios)
);

/* ============================================================
 * 3) Listado tesorería (ADMIN)
 * ============================================================ */
router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  asyncHandler(PagosController.adminListado)
);

/* ============================================================
 * 🔥 4) Webpay — webhook (server → server)
 * ============================================================ */
router.post(
  "/webpay/notificacion",
  asyncHandler(PagosController.webhookWebpay)
);

/* ============================================================
 * 🔥 5) Webpay — retorno (browser → backend → front)
 * ============================================================ */
router.get(
  "/webpay/retorno",
  asyncHandler(PagosController.retornoWebpay)
);

/* ============================================================
 * 6) Consultar estado de pago individual (SIEMPRE AL FINAL)
 * ============================================================ */
router.get(
  "/:id",
  authGuard,
  asyncHandler(PagosController.estado)
);

export default router;
