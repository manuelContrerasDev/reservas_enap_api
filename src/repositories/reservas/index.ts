// src/repositories/reservas/index.ts

/* ============================================================
 * RESERVAS — Repositories (ENAP 2025)
 *
 * Orden recomendado:
 * 1) Create / Read (flujo base)
 * 2) Admin (listado, estado, queries)
 * 3) Dominios específicos (Piscina, Invitados, Update)
 * 4) Automatizaciones / Jobs (Caducidad)
 * 5) Flujos especiales (Manual admin)
 * ============================================================ */

// 1) Base
export * from "./create.repository";
export * from "./read.repository";
export * from "./cancelar.repository";

// 2) Admin
export * from "./admin.repository";

// 3) Dominios
export * from "./piscina.repository";
export * from "./invitados.repository";
export * from "./update.repository";

// 4) Automatizaciones (SYSTEM)
export * from "./caducidad.repository";

// 5) Admin manual
export * from "./manual.repository";
