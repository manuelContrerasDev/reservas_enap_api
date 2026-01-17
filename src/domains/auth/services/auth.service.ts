import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { TokenService } from "@/shared/services/TokenService";
import { EmailService } from "@/shared/services/EmailService";
import { AuthErrorCode } from "../types/auth.errors";

/* ============================================================
 * CONSTANTES DE DOMINIO
 * ============================================================ */
const EMAIL_CONFIRM_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_EXPIRES_MS = 30 * 60 * 1000; // 30 min

// Hash dummy para mitigar timing attacks
const DUMMY_HASH =
  "$2a$12$Cq9E8E7uZcZ4sZ8FzHc9kOqGf6l5x7Wn9D5Bq6zKJ8eKcKpY9s8R6";

/* ============================================================
 * HELPERS INTERNOS
 * ============================================================ */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function resolveRoleByEmail(email: string): Role {
  return getEmailDomain(email) === "enap.cl" ? Role.SOCIO : Role.EXTERNO;
}

/* ============================================================
 * REGISTER
 * ============================================================ */
export async function registerService(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = normalizeEmail(input.email);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { ok: false as const, error: AuthErrorCode.EMAIL_ALREADY_REGISTERED };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const emailConfirmToken = TokenService.generateToken(32);
  const emailConfirmExpires = TokenService.expiresIn(EMAIL_CONFIRM_EXPIRES_MS);
  const role = resolveRoleByEmail(email);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name ?? null,
      role,
      emailConfirmed: false,
      emailConfirmToken,
      emailConfirmExpires,
      emailDomain: getEmailDomain(email),
      emailLocked: false,
    },
  });

  const confirmUrl = `${process.env.WEB_URL}/auth/confirm?token=${emailConfirmToken}`;

  // Side-effect seguro: no rompe el registro
  EmailService.sendConfirmEmail({
    to: user.email,
    name: user.name,
    confirmUrl,
  }).catch((err) => {
    console.warn("⚠️ [AUTH][REGISTER][EMAIL_CONFIRM_FAIL]", {
      userId: user.id,
      error: err?.message,
    });
  });

  return { ok: true as const };
}

/* ============================================================
 * LOGIN
 * ============================================================ */
export async function loginService(input: {
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);

  const user = await prisma.user.findUnique({ where: { email } });

  // Mitigación timing attack
  if (!user) {
    await bcrypt.compare(input.password, DUMMY_HASH);
    return { ok: false as const, error: AuthErrorCode.INVALID_CREDENTIALS };
  }

  const validPassword = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!validPassword) {
    return { ok: false as const, error: AuthErrorCode.INVALID_CREDENTIALS };
  }

  if (!user.emailConfirmed) {
    return { ok: false as const, error: AuthErrorCode.EMAIL_NOT_CONFIRMED };
  }

  const token = TokenService.sign({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return {
    ok: true as const,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };
}

/* ============================================================
 * ME
 * ============================================================ */
export async function meService(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailConfirmed: true,
      createdAt: true,
    },
  });

  if (!user) {
    // Semántica correcta: token inválido / sesión inválida
    return { ok: false as const, error: AuthErrorCode.INVALID_CREDENTIALS };
  }

  return { ok: true as const, user };
}

/* ============================================================
 * CONFIRM EMAIL
 * ============================================================ */
export async function confirmEmailService(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      emailConfirmToken: token,
      emailConfirmExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return { ok: false as const, error: AuthErrorCode.INVALID_OR_EXPIRED_TOKEN };
  }

  if (user.emailConfirmed) {
    return { ok: false as const, error: AuthErrorCode.EMAIL_ALREADY_CONFIRMED };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailConfirmed: true,
      emailConfirmToken: null,
      emailConfirmExpires: null,
    },
  });

  return { ok: true as const };
}

/* ============================================================
 * RESEND CONFIRMATION
 * ============================================================ */
export async function resendConfirmationService(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  // Respuesta neutra (anti user-enumeration)
  if (!user) return { ok: true as const };

  if (user.emailConfirmed) {
    return {
      ok: false as const,
      error: AuthErrorCode.EMAIL_ALREADY_CONFIRMED,
    };
  }

  const token = TokenService.generateToken(32);
  const expires = TokenService.expiresIn(EMAIL_CONFIRM_EXPIRES_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailConfirmToken: token,
      emailConfirmExpires: expires,
    },
  });

  const confirmUrl = `${process.env.WEB_URL}/auth/confirm?token=${token}`;

  await EmailService.sendConfirmEmail({
    to: user.email,
    name: user.name,
    confirmUrl,
  });

  return { ok: true as const };
}

/* ============================================================
 * RESET PASSWORD — REQUEST
 * ============================================================ */
export async function resetRequestService(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  // Respuesta neutra
  if (!user) return { ok: true as const };

  // 🔐 Seguridad: invalidar tokens previos no usados
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  const token = TokenService.generateToken(32);
  const expiresAt = TokenService.expiresIn(RESET_EXPIRES_MS);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const resetUrl = `${process.env.WEB_URL}/auth/reset-confirm?token=${token}`;

  await EmailService.sendResetPasswordEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });

  return { ok: true as const };
}

/* ============================================================
 * CHECK RESET TOKEN
 * ============================================================ */
export async function checkResetService(token: string) {
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  });

  if (!record) {
    return { ok: false as const, error: AuthErrorCode.INVALID_OR_EXPIRED_TOKEN };
  }

  return { ok: true as const };
}

/* ============================================================
 * RESET PASSWORD — CONFIRM
 * ============================================================ */
export async function resetPasswordService(input: {
  token: string;
  newPassword: string;
}) {
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      token: input.token,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  });

  if (!record) {
    return { ok: false as const, error: AuthErrorCode.INVALID_OR_EXPIRED_TOKEN };
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token: input.token },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true as const };
}
