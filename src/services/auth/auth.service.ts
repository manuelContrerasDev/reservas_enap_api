// src/modules/auth/auth.service.ts

import { prisma } from "../../lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { TokenService } from "../../shared/services/TokenService";
import { EmailService } from "../../shared/services/EmailService";

/* ============================================================================
 * CONSTANTES
 * ============================================================================ */
const EMAIL_CONFIRM_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_EXPIRES_MS = 30 * 60 * 1000; // 30 min
const RESET_COOLDOWN_MS = 5 * 60 * 1000; // 5 min
const RESEND_CONFIRM_COOLDOWN_MS = 5 * 60 * 1000; // 5 min

// Hash dummy para mitigar timing attacks
const DUMMY_HASH =
  "$2a$12$Cq9E8E7uZcZ4sZ8FzHc9kOqGf6l5x7Wn9D5Bq6zKJ8eKcKpY9s8R6";

/* ============================================================================
 * HELPERS INTERNOS
 * ============================================================================ */
function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function resolveRoleByEmail(email: string): Role {
  return getEmailDomain(email) === "enap.cl" ? Role.SOCIO : Role.EXTERNO;
}

/* ============================================================================
 * REGISTER
 * ============================================================================ */
export async function registerService(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = input.email.trim().toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
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

  // Envío de email (no bloqueante)
  EmailService.sendConfirmEmail({
    to: user.email,
    name: user.name,
    confirmUrl,
  }).catch(() => {});

  return {
    message: "Usuario registrado. Revisa tu correo para confirmar la cuenta.",
  };
}

/* ============================================================================
 * LOGIN
 * ============================================================================ */
export async function loginService(input: {
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ⛔️ Usuario no existe → invalid credentials
  if (!user) {
    await bcrypt.compare(input.password, DUMMY_HASH); // timing attack protection
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "Correo o contraseña incorrectos",
    };
  }

  // ⛔️ Contraseña incorrecta → invalid credentials
  const validPassword = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!validPassword) {
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "Correo o contraseña incorrectos",
    };
  }

  // ⛔️ Correo NO confirmado → ESTE CASO YA NO SE PIERDE
  if (!user.emailConfirmed) {
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIRMED",
      message: "Tu correo aún no está confirmado",
    };
  }

  // ✅ LOGIN OK
  const token = TokenService.sign({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return {
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };
}


/* ============================================================================
 * ME
 * ============================================================================ */
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
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

/* ============================================================================
 * CONFIRM EMAIL
 * ============================================================================ */
export async function confirmEmailService(token: string) {
  if (!token || token.trim().length === 0) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  // 🔹 Buscar por token (aunque esté expirado)
  const user = await prisma.user.findFirst({
    where: { emailConfirmToken: token },
  });

  if (!user) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  // 🔹 Ya confirmado → OK idempotente
  if (user.emailConfirmed) {
    return { alreadyConfirmed: true };
  }

  // 🔹 Expirado solo si NO está confirmado
  if (
    user.emailConfirmExpires &&
    user.emailConfirmExpires < new Date()
  ) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailConfirmed: true,
      emailConfirmToken: null,
      emailConfirmExpires: null,
      emailLocked: user.role === Role.SOCIO,
    },
  });

  return { confirmed: true };
}


/* ============================================================================
 * RESEND CONFIRMATION
 * ============================================================================ */
export async function resendConfirmationService(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Respuesta neutra
  if (!user) return;

  if (user.emailConfirmed) {
    throw new Error("EMAIL_ALREADY_CONFIRMED");
  }

  if (
    user.emailConfirmExpires &&
    user.emailConfirmExpires.getTime() - EMAIL_CONFIRM_EXPIRES_MS + RESEND_CONFIRM_COOLDOWN_MS >
      Date.now()
  ) {
    return;
  }

  const newToken = TokenService.generateToken(32);
  const expires = TokenService.expiresIn(EMAIL_CONFIRM_EXPIRES_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailConfirmToken: newToken,
      emailConfirmExpires: expires,
    },
  });

  const confirmUrl = `${process.env.WEB_URL}/auth/confirm?token=${newToken}`;

  await EmailService.sendConfirmEmail({
    to: user.email,
    name: user.name,
    confirmUrl,
  });
}

/* ============================================================================
 * REQUEST RESET PASSWORD — SINGLE ACTIVE TOKEN
 * ============================================================================ */
export async function requestResetService(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // 🔒 Respuesta neutra (anti-enumeración)
  if (!user) return;

  // 🛑 Eliminar TODOS los tokens activos previos (no usados)
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  // ⏱️ Generar nuevo token
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

  // 📧 Envío de email
  await EmailService.sendResetPasswordEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });
}


/* ============================================================================
 * CHECK RESET TOKEN
 * ============================================================================ */
export async function checkResetService(token: string) {
  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  });

  if (!tokenRecord) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  return true;
}

/* ============================================================================
 * RESET PASSWORD
 * ============================================================================ */
export async function resetPasswordService(input: {
  token: string;
  newPassword: string;
}) {
  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      token: input.token,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  });

  if (!tokenRecord) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  await prisma.$transaction(async (tx) => {
    const passwordHash = await bcrypt.hash(input.newPassword, 12);

    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.update({
      where: { token: input.token },
      data: { usedAt: new Date() },
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        userId: tokenRecord.userId,
        usedAt: null,
        NOT: { token: input.token },
      },
    });
  });

  return { message: "Contraseña actualizada correctamente." };
}
