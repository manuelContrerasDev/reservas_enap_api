// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth/auth.controller";
import { authGuard } from "../middlewares/authGuard";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../middlewares/asyncHandler";

import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  resetPasswordSchema,
} from "../validators/auth.schema";

const router = Router();

/* ============================================================================
 * REGISTER
 * ============================================================================ */
router.post(
  "/register",
  (req, _res, next) => {
    console.log("🔥 LLEGÓ peticion REGISTER");
    console.log("BODY recibido →", req.body);
    next();
  },
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

/* ============================================================================
 * LOGIN
 * ============================================================================ */
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

/* ============================================================================
 * /me (usuario autenticado)
 * ============================================================================ */
router.get("/me", authGuard, asyncHandler(AuthController.me));

/* ============================================================================
 * RESET PASSWORD: 1) REQUEST LINK
 * ============================================================================ */
router.post(
  "/reset-request",
  validate(resetRequestSchema),
  asyncHandler(AuthController.requestReset)
);

/* ============================================================================
 * RESET PASSWORD: 3) ACTUALIZAR PASSWORD
 * ============================================================================ */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(AuthController.resetPassword)
);

/* ============================================================================
 * CONFIRM EMAIL
 * ============================================================================ */
router.get(
  "/confirm",
  asyncHandler(AuthController.confirmEmail)
);

/* ============================================================================
 * REENVIAR CONFIRMACIÓN DE EMAIL
 * ============================================================================ */
router.post(
  "/resend-confirmation",
  asyncHandler(AuthController.resendConfirmation)
);

export default router;


router.get("/check-reset", AuthController.checkReset);
