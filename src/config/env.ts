// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

const NODE_ENV = (process.env.NODE_ENV ?? "development") as
  | "development"
  | "production"
  | "prisma";

if (NODE_ENV === "development") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
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

    // ✅ Caducidad automática
    ENABLE_CADUCIDAD_JOB: z.enum(["true", "false"]).default("true"),
    CADUCIDAD_CRON: z.string().optional(), // ej: "*/5 * * * *"
    CADUCIDAD_BATCH_SIZE: z.string().optional(), // "200"

    // Brevo (email)
    BREVO_API_KEY: z.string().optional(),
    BREVO_FROM_EMAIL: z.string().optional(),
    BREVO_FROM_NAME: z.string().optional(),

    // Webpay
    WEBPAY_COMMERCE_CODE: z.string().optional(),
    WEBPAY_API_KEY: z.string().optional(),
    WEBPAY_ENV: z.string().optional(),
    WEBPAY_RETURN_URL: z.string().optional(),
    WEBPAY_FINAL_URL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
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

    // ✅ batch size válido si viene
    if (env.CADUCIDAD_BATCH_SIZE) {
      const n = Number(env.CADUCIDAD_BATCH_SIZE);
      if (!Number.isFinite(n) || n < 1 || n > 1000) {
        ctx.addIssue({
          path: ["CADUCIDAD_BATCH_SIZE"],
          message: "CADUCIDAD_BATCH_SIZE debe ser número entre 1 y 1000",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export const env = EnvSchema.parse(process.env);

export const EMAIL_ENABLED = env.ENABLE_EMAIL === "true";
export const WEBPAY_ENABLED = env.ENABLE_WEBPAY === "true";
