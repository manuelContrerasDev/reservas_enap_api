// src/validators/auth.schema.ts
import { z } from "zod";

/* ============================================================
 * HELPERS
 * ============================================================*/

// Normaliza email → lowercase y sin espacios
const emailSchema = z
  .string()
  .min(5, "Correo requerido")
  .email("Formato de correo inválido")
  .transform((v) => v.trim().toLowerCase());

// Optional string con normalización + límite
const optionalString = z
  .string()
  .trim()
  .min(1, "Valor inválido");

const optionalStringMax = (max: number) =>
  optionalString.max(max).optional();

/* ============================================================
 * ENUMS
 * ============================================================*/
export const UserRoleEnum = z.enum(["ADMIN", "SOCIO", "EXTERNO"]);

/* ============================================================
 * REGISTRO
 * ============================================================*/
export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña es demasiado larga"),
  name: optionalStringMax(80).optional(),
  role: UserRoleEnum.optional().default("SOCIO"),
});

/* ============================================================
 * LOGIN
 * ============================================================*/
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(4, "Debes ingresar tu contraseña")
    .max(100, "Contraseña demasiado larga"),
});

/* ============================================================
 * REQUEST RESET
 * ============================================================*/
export const resetRequestSchema = z.object({
  email: emailSchema,
});

/* ============================================================
 * RESET PASSWORD
 * ============================================================*/
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(10, "Token inválido")
    .max(200, "Token demasiado largo"),

  newPassword: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
    .max(100, "La nueva contraseña es demasiado larga"),
});

/* ============================================================
 * TYPES
 * ============================================================*/
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type ResetRequestSchemaType = z.infer<typeof resetRequestSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
