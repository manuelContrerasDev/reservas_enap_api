// src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

// Cargar env excepto cuando prisma ejecuta migrate/seed
if (process.env.NODE_ENV !== "prisma") {
  dotenv.config();
}

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.string().optional(),

  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  WEB_URL: z.string(),

  WEBPAY_COMMERCE_CODE: z.string(),
  WEBPAY_API_KEY: z.string(),
  WEBPAY_ENV: z.string(),
  WEBPAY_RETURN_URL: z.string(),
  WEBPAY_FINAL_URL: z.string(),
});

export const env = EnvSchema.parse(process.env);
