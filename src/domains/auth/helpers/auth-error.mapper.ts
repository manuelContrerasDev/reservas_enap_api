import { AuthErrorCode } from "../types/auth.errors";

export function mapAuthErrorToHttp(error: AuthErrorCode): number {
  switch (error) {
    case AuthErrorCode.INVALID_CREDENTIALS:
      return 401;

    case AuthErrorCode.EMAIL_NOT_CONFIRMED:
      return 403;

    case AuthErrorCode.EMAIL_ALREADY_REGISTERED:
      return 409;

    case AuthErrorCode.EMAIL_ALREADY_CONFIRMED:
      return 409;

    case AuthErrorCode.INVALID_OR_EXPIRED_TOKEN:
      return 400;

    default:
      return 500;
  }
}
