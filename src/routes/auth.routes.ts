// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth/auth.controller";
import { authGuard } from "../middlewares/authGuard";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../middlewares/asyncHandler";
import { strictLimiter } from "../middlewares/rateLimit";

import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  resetPasswordSchema,
} from "../validators/auth.schema";

const router = Router();

/* ============================================================================
 * REGISTER
 * ============================================================================
 * Protegido contra spam / bots
 */
router.post(
  "/register",
  strictLimiter,
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

/* ============================================================================
 * LOGIN
 * ============================================================================
 * Protegido contra fuerza bruta
 */
router.post(
  "/login",
  strictLimiter,
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

/* ============================================================================
 * /me (usuario autenticado)
 * ============================================================================
 */
router.get(
  "/me",
  authGuard,
  asyncHandler(AuthController.me)
);

/* ============================================================================
 * RESET PASSWORD: 1) REQUEST LINK
 * ============================================================================
 * Protegido contra abuso de emails
 */
router.post(
  "/reset-request",
  strictLimiter,
  validate(resetRequestSchema),
  asyncHandler(AuthController.requestReset)
);

/* ============================================================================
 * RESET PASSWORD: 2) CHECK TOKEN (opcional/debug)
 * ============================================================================
 * NO rate limit (acceso desde link)
 */
router.get(
  "/check-reset",
  asyncHandler(AuthController.checkReset)
);

/* ============================================================================
 * RESET PASSWORD: 3) ACTUALIZAR PASSWORD
 * ============================================================================
 * Protegido contra intentos repetidos
 */
router.post(
  "/reset-password",
  strictLimiter,
  validate(resetPasswordSchema),
  asyncHandler(AuthController.resetPassword)
);

/* ============================================================================
 * CONFIRM EMAIL
 * ============================================================================
 * NO rate limit (acceso desde link de email)
 */
router.get(
  "/confirm",
  asyncHandler(AuthController.confirmEmail)
);

/* ============================================================================
 * REENVIAR CONFIRMACIÓN DE EMAIL
 * ============================================================================
 * Protegido contra spam
 */
router.post(
  "/resend-confirmation",
  strictLimiter,
  asyncHandler(AuthController.resendConfirmation)
);

export default router;
