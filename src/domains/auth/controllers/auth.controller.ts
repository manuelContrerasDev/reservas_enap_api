import { register } from "./register.controller";
import { login } from "./login.controller";
import { me } from "./me.controller";
import { requestReset } from "../../../controllers/auth/reset-request.controller";
import { checkReset } from "./check-reset.controller";
import { resetPassword } from "./reset-password.controller";
import { confirmEmail } from "./confirm-email.controller";
import { resendConfirmation } from "./resend-confirmation.controller";

export const AuthController = {
  register,
  login,
  me,
  requestReset,
  checkReset,
  resetPassword,
  confirmEmail,
  resendConfirmation,
};
