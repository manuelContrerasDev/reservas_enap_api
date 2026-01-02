// src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

// Cargar env excepto cuando prisma ejecuta migrate/seed
if (process.env.NODE_ENV !== "prisma") {
  dotenv.config();
}

const EnvSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    PORT: z.string().optional(),

    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    WEB_URL: z.string(),

    // 🔒 Webpay: opcionales por defecto
    WEBPAY_COMMERCE_CODE: z.string().optional(),
    WEBPAY_API_KEY: z.string().optional(),
    WEBPAY_ENV: z.string().optional(),
    WEBPAY_RETURN_URL: z.string().optional(),
    WEBPAY_FINAL_URL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // 🔥 SOLO exigir Webpay en producción
    if (env.NODE_ENV === "production") {
      const requiredInProd = [
        "WEBPAY_COMMERCE_CODE",
        "WEBPAY_API_KEY",
        "WEBPAY_ENV",
        "WEBPAY_RETURN_URL",
        "WEBPAY_FINAL_URL",
      ] as const;

      requiredInProd.forEach((key) => {
        if (!env[key]) {
          ctx.addIssue({
            path: [key],
            message: `${key} es obligatorio en producción`,
            code: z.ZodIssueCode.custom,
          });
        }
      });
    }
  });

export const env = EnvSchema.parse(process.env);
