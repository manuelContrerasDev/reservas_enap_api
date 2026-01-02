import "module-alias/register";
import "./load-env";

import path from "path";

/// <reference path="./types/express-xss-sanitizer.d.ts" />

import express, { Application } from "express";
import morgan from "morgan";
import { xss } from "express-xss-sanitizer";
import swaggerUi from "swagger-ui-express";

import { prisma } from "./lib/db";
import { swaggerSpec } from "./docs/swagger";

import { security } from "./middlewares/security";
import { apiLimiter } from "./middlewares/rateLimit";
import { errorHandler } from "./middlewares/errorHandler";

// ✅ Fuente única de verdad para ENV
import { env } from "./config/env";

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
console.log(`🔑 ENV validado OK (ENABLE_EMAIL=${env.ENABLE_EMAIL}, ENABLE_WEBPAY=${env.ENABLE_WEBPAY})`);

const appRootDir = path.resolve();

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

// ✅ Si /api/pagos hoy muestra info estática de transferencia, puede quedarse.
// ✅ Si tenía lógica webpay interna, igual no se activará si tu código depende de ENABLE_WEBPAY.
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
    message: "API Reservas ENAP — Backend Operativo",
  });
});

// ============================================================
// Error handlers oficiales
// ============================================================

// 404
app.use((_, res) => res.status(404).json({ ok: false, error: "Ruta no encontrada" }));

// Handler global ENAP
app.use(errorHandler);

// ============================================================
// Inicio del servidor
// ============================================================
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor TS (${NODE_ENV}) en puerto ${PORT}`);
});

// ============================================================
// Shutdown
// ============================================================
const shutdown = async () => {
  console.log("🧹 Cerrando servidor y DB...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
