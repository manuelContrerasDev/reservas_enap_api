/**
 * AUTH CONTROLLERS — PUBLIC API
 * ============================================================================
 * Este index define la API pública del módulo AUTH.
 *
 * ❌ No exporta implementaciones internas
 * ❌ No expone sufijos "Controller"
 * ✅ Mantiene naming consistente con auth.routes.ts
 *
 * Contrato:
 * AuthController.<action>
 */

import { registerController } from "./register.controller";
import { loginController } from "./login.controller";
import { meController } from "./me.controller";
import { resetRequestController } from "./reset-request.controller";
import { checkResetController } from "./check-reset.controller";
import { resetPasswordController } from "./reset-password.controller";
import { confirmEmailController } from "./confirm-email.controller";
import { resendConfirmationController } from "./resend-confirmation.controller";

export const AuthController = {
  /** POST /auth/register */
  register: registerController,

  /** POST /auth/login */
  login: loginController,

  /** GET /auth/me */
  me: meController,

  /** POST /auth/reset-request */
  requestReset: resetRequestController,

  /** GET /auth/check-reset */
  checkReset: checkResetController,

  /** POST /auth/reset-password */
  resetPassword: resetPasswordController,

  /** GET /auth/confirm */
  confirmEmail: confirmEmailController,

  /** POST /auth/resend-confirmation */
  resendConfirmation: resendConfirmationController,
};

export type AuthControllerType = typeof AuthController;
