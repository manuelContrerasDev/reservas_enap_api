import "module-alias/register";
import "./load-env";

import path from "path";

const required = (name: string, value: any) => {
  if (!value) {
    console.error(`❌ Falta variable de entorno: ${name}`);
    throw new Error(`Missing ENV variable: ${name}`);
  }
};

// Validar solo si NO estamos en modo prisma
if (process.env.NODE_ENV !== "prisma") {
  required("DATABASE_URL", process.env.DATABASE_URL);
  required("JWT_SECRET", process.env.JWT_SECRET);
  required("WEB_URL", process.env.WEB_URL);

  if (process.env.NODE_ENV === "production") {
    required("WEBPAY_COMMERCE_CODE", process.env.WEBPAY_COMMERCE_CODE);
    required("WEBPAY_API_KEY", process.env.WEBPAY_API_KEY);
    required("WEBPAY_ENV", process.env.WEBPAY_ENV);
    required("WEBPAY_RETURN_URL", process.env.WEBPAY_RETURN_URL);
    required("WEBPAY_FINAL_URL", process.env.WEBPAY_FINAL_URL);
  }

  console.log("✔ ENV cargado y validado correctamente");
}

// ============================================================
// Imports del servidor
// ============================================================

/// <reference path="./types/express-xss-sanitizer.d.ts" />

import express, { Application } from "express";
import morgan from "morgan";
import { xss } from "express-xss-sanitizer";
import { prisma } from "./lib/db";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

// Seguridad y control
import { security } from "./middlewares/security";
import { apiLimiter } from "./middlewares/rateLimit";

// 🔥 Handler oficial de errores
import { errorHandler } from "./middlewares/errorHandler";

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

// ============================================================
// App Config
// ============================================================
const app: Application = express();

const PORT = Number(process.env.PORT) || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

console.log(`🌍 Modo: ${NODE_ENV}`);
console.log(`🔑 Variables ENV cargadas correctamente.`);

const appRootDir = path.resolve();

// ============================================================
// Seguridad y middlewares
// ============================================================
app.set("trust proxy", 1);

// 🔒 Seguridad centralizada
app.use(security.helmet);
app.use(security.cors);

// Parsers y logs
app.use(xss());
app.use(express.json({ limit: "12kb" }));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// 🚦 PASO 3 — Rate limit por contexto
app.use("/api", apiLimiter);

// ============================================================
// Static
// ============================================================
app.use("/images", express.static(path.join(appRootDir, "public/images")));

// ============================================================
// Swagger Docs
// ============================================================
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/docs.json", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ============================================================
// Rutas API
// ============================================================
app.use("/api/auth", authRoutes);
app.use("/api/espacios", espaciosRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/admin/reservas", adminReservasRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api", testRoutes);

// ============================================================
// Health
// ============================================================
app.get("/health", (_, res) =>
  res.status(200).json({ status: "ok", env: NODE_ENV })
);

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
app.use((req, res) =>
  res.status(404).json({ ok: false, error: "Ruta no encontrada" })
);

// Handler global ENAP
app.use(errorHandler);

// ============================================================
// Inicio del servidor
// ============================================================
const server = app.listen(PORT, async () => {
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
