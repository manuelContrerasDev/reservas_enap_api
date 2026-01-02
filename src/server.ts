import "module-alias/register";

import path from "path";
import express, { Application } from "express";
import morgan from "morgan";
import { xss } from "express-xss-sanitizer";
import swaggerUi from "swagger-ui-express";

import { prisma } from "./lib/db";
import { swaggerSpec } from "./docs/swagger";

import { security } from "./middlewares/security";
import { apiLimiter } from "./middlewares/rateLimit";
import { errorHandler } from "./middlewares/errorHandler";

import { env, EMAIL_ENABLED, WEBPAY_ENABLED } from "./config/env";

// Rutas
import authRoutes from "./routes/auth.routes";
import espaciosRoutes from "./routes/espacios.routes";
import reservasRoutes from "./routes/reservas.routes";
import pagosRoutes from "./routes/pagos.routes";
import debugRoutes from "./routes/debug.routes";
import testRoutes from "./routes/test.routes";

// Admin
import adminReservasRoutes from "./routes/admin/reservas.admin.routes";
import adminUsersRoutes from "./routes/admin/users.admin.routes";

const app: Application = express();

const PORT = Number(env.PORT) || Number(process.env.PORT) || 4000;
const NODE_ENV = env.NODE_ENV;

console.log(`🌍 Modo: ${NODE_ENV}`);
console.log(`🔑 ENV validado OK (ENABLE_EMAIL=${EMAIL_ENABLED}, ENABLE_WEBPAY=${WEBPAY_ENABLED})`);

const appRootDir = process.cwd();

// ============================================================
// Seguridad y middlewares
// ============================================================
app.set("trust proxy", 1);

app.use(security.helmet);
app.use(security.cors);

app.use(xss());
app.use(express.json({ limit: "12kb" }));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", apiLimiter);

// ============================================================
// Static
// ============================================================
app.use("/images", express.static(path.join(appRootDir, "public/images")));

// ============================================================
// Swagger Docs (solo DEV)
// ============================================================
if (NODE_ENV !== "production") {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/docs.json", (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

// ============================================================
// Rutas API
// ============================================================
app.use("/api/auth", authRoutes);
app.use("/api/espacios", espaciosRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/pagos", pagosRoutes);

// Admin
app.use("/api/admin/reservas", adminReservasRoutes);
app.use("/api/admin/users", adminUsersRoutes);

// Debug/Test solo DEV
if (NODE_ENV !== "production") {
  app.use("/api/debug", debugRoutes);
  app.use("/api", testRoutes);
}

// ============================================================
// Health (Render friendly + DB check)
// ============================================================
app.get("/health", async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", env: NODE_ENV });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected", env: NODE_ENV });
  }
});

// ============================================================
// Index
// ============================================================
app.get("/", (_, res) => {
  res.json({
    status: "ok",
    env: NODE_ENV,
    version: "1.0.0",
    message: "API Reservas ENAP — Backend Operativo"
  });
});

// ============================================================
// 404 + Error handler global
// ============================================================
app.use((_, res) => res.status(404).json({ ok: false, error: "Ruta no encontrada" }));
app.use(errorHandler);

// ============================================================
// Inicio del servidor
// ============================================================
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor TS (${NODE_ENV}) en puerto ${PORT}`);
});

// ============================================================
// Shutdown PRO (anti-colgado)
// ============================================================
let isShuttingDown = false;

const shutdown = async (reason: string, err?: unknown) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (err) console.error(`🧨 Shutdown por ${reason}:`, err);
  else console.log(`🧹 Cerrando servidor y DB (${reason})...`);

  // Hard exit fallback (evita quedarse colgado en producción)
  const forceExit = setTimeout(() => {
    console.error("⏱️ Force exit: shutdown timeout");
    process.exit(1);
  }, 8000);
  forceExit.unref();

  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error("⚠️ Error desconectando Prisma:", e);
  }

  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (err) => shutdown("unhandledRejection", err));
process.on("uncaughtException", (err) => shutdown("uncaughtException", err));
