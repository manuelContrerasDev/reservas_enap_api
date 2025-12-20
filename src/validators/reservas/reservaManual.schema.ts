// ============================================================
// reservaManual.schema.ts — ENAP 2025 (VERSION DEFINITIVA)
// ============================================================

import { z } from "zod";

export const reservaManualSchema = z.object({
  userId: z.string().uuid("ID usuario inválido"),
  espacioId: z.string().uuid("ID espacio inválido"),

  fechaInicio: z.string().min(5, "Fecha inicio requerida"),
  fechaFin: z.string().min(5, "Fecha fin requerida"),

  cantidadAdultos: z.number().int().min(1, "Debe haber al menos 1 adulto"),
  cantidadNinos: z.number().int().min(0),
  cantidadPiscina: z.number().int().min(0),

  marcarPagada: z.boolean().optional(),

  usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]),

  // 🔥 Datos de contacto DIRECTOS
  nombreSocio: z.string().min(2),
  rutSocio: z.string().min(3),
  telefonoSocio: z.string().min(5),
  correoEnap: z.string().email(),
  correoPersonal: z.string().email().optional(),

  // 🔥 Responsable (solo si no es uso personal — validación se hace en service)
  nombreResponsable: z.string().optional(),
  rutResponsable: z.string().optional(),
  emailResponsable: z.string().email().optional(),
  telefonoResponsable: z.string().optional(),

  creadaPor: z.string().uuid("ID administrador inválido"),
});

export type ReservaManualPayload = z.infer<typeof reservaManualSchema>;
