// src/middlewares/security.ts
import helmet from "helmet";
import cors from "cors";
import { env } from "../config/env";
import rateLimit from "express-rate-limit";

const allowedOrigins = [env.WEB_URL, "http://localhost:5173"];

export const security = {
  helmet: helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),

  cors: cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error("CORS bloqueado: origen no permitido"));
    },
    credentials: true,
  }),

  limiter: rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas peticiones. Inténtalo más tarde." },
  }),
};
