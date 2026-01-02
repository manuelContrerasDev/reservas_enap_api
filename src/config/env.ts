// src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

// Cargar env excepto cuando prisma ejecuta migrate/seed
if (process.env.NODE_ENV !== "prisma") {
  dotenv.config();
}

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "prisma"]).default("development"),
    PORT: z.string().optional(),

    // Core
    DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET es obligatorio"),
    WEB_URL: z.string().url("WEB_URL debe ser una URL válida"),
    PUBLIC_API_URL: z.string().url("PUBLIC_API_URL debe ser una URL válida"),

    // Feature flags
    ENABLE_WEBPAY: z.enum(["true", "false"]).default("false"),
    ENABLE_EMAIL: z.enum(["true", "false"]).default("false"),

    // Brevo (email)
    BREVO_API_KEY: z.string().optional(),
    BREVO_FROM_EMAIL: z.string().optional(),
    BREVO_FROM_NAME: z.string().optional(),

    // Webpay (solo si se activa)
    WEBPAY_COMMERCE_CODE: z.string().optional(),
    WEBPAY_API_KEY: z.string().optional(),
    WEBPAY_ENV: z.string().optional(),
    WEBPAY_RETURN_URL: z.string().optional(),
    WEBPAY_FINAL_URL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // 🔐 Email obligatorio si ENABLE_EMAIL=true (Brevo)
    if (env.ENABLE_EMAIL === "true") {
      const required = ["BREVO_API_KEY", "BREVO_FROM_EMAIL", "BREVO_FROM_NAME"] as const;

      required.forEach((key) => {
        if (!env[key] || String(env[key]).trim() === "") {
          ctx.addIssue({
            path: [key],
            message: `${key} es obligatorio cuando ENABLE_EMAIL=true`,
            code: z.ZodIssueCode.custom,
          });
        }
      });
    }

    // 💳 Webpay solo si se activa (CONGELADO => ENABLE_WEBPAY=false)
    if (env.ENABLE_WEBPAY === "true") {
      const required = [
        "WEBPAY_COMMERCE_CODE",
        "WEBPAY_API_KEY",
        "WEBPAY_ENV",
        "WEBPAY_RETURN_URL",
        "WEBPAY_FINAL_URL",
      ] as const;

      required.forEach((key) => {
        if (!env[key] || String(env[key]).trim() === "") {
          ctx.addIssue({
            path: [key],
            message: `${key} es obligatorio cuando ENABLE_WEBPAY=true`,
            code: z.ZodIssueCode.custom,
          });
        }
      });
    }
  });

export const env = EnvSchema.parse(process.env);
