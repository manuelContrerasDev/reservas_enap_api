import helmet from "helmet";
import cors from "cors";
import { env } from "../config/env";

const allowedOrigins = new Set([env.WEB_URL, "http://localhost:5173"]);

export const security = {
  helmet: helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),

  cors: cors({
    origin(origin, cb) {
      // Permite requests server-to-server / tools sin origin
      if (!origin) return cb(null, true);

      if (allowedOrigins.has(origin)) return cb(null, true);

      return cb(new Error("CORS bloqueado: origen no permitido"));
    },
    credentials: true,
  }),
};
