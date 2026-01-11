// src/validators/auth.schema.ts
import { z } from "zod";

/* ============================================================
 * HELPERS
 * ============================================================ */

// Email normalizado (lowercase + trim)
export const emailSchema = z
  .string()
  .min(5, "Correo requerido")
  .email("Formato de correo inválido")
  .transform((v) => v.trim().toLowerCase());

// Optional string con normalización
const optionalString = z
  .string()
  .trim()
  .min(1, "Valor inválido");

const optionalStringMax = (max: number) =>
  optionalString.max(max).optional();

/* ============================================================
 * REGISTRO
 * ============================================================ */
/**
 * ⚠️ IMPORTANTE:
 * - NO se acepta role desde frontend
 * - El rol se calcula SOLO en el backend según dominio del email
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña es demasiado larga"),
  name: optionalStringMax(80),
});

/* ============================================================
 * LOGIN
 * ============================================================ */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(4, "Debes ingresar tu contraseña")
    .max(100, "Contraseña demasiado larga"),
});

/* ============================================================
 * REQUEST RESET PASSWORD
 * ============================================================ */
export const resetRequestSchema = z.object({
  email: emailSchema,
});

/* ============================================================
 * RESET PASSWORD
 * ============================================================ */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(10, "Token inválido")
    .max(200, "Token demasiado largo"),

  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(100, "La nueva contraseña es demasiado larga"),
});

/* ============================================================
 * RESEND CONFIRMATION EMAIL
 * ============================================================ */
export const resendConfirmationSchema = z.object({
  email: emailSchema,
});

/* ============================================================
 * CHECK RESET TOKEN
 * ============================================================ */
export const checkResetSchema = z.object({
  token: z
    .string()
    .min(10, "Token inválido")
    .max(200, "Token demasiado largo"),
});

/* ============================================================
 * TYPES
 * ============================================================ */
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type ResetRequestSchemaType = z.infer<typeof resetRequestSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type ResendConfirmationSchemaType = z.infer<typeof resendConfirmationSchema>;
export type CheckResetSchemaType = z.infer<typeof checkResetSchema>;
