// ============================================================
// crear-reserva.schema.ts — ENAP 2025 (VERSIÓN SINCRONIZADA)
// ============================================================

import { z } from "zod";
import { baseReservaSchema } from "./base-reserva.schema";
import { validarRangoFechas } from "./fechas.schema";
import { validarResponsable } from "./responsable.schema";
import { validarInvitados } from "./invitados.schema";

export const crearReservaSchema = baseReservaSchema.superRefine((data, ctx) => {
  /* --------------------------------------------------------
   * 1) Validar rango de fechas (solo consistencia)
   * -------------------------------------------------------- */
  validarRangoFechas(data, ctx);

  /* --------------------------------------------------------
   * 2) Validar responsable según reglas ENAP 2025
   *   - USO_PERSONAL → responsable prohibido
   *   - CARGA_DIRECTA / TERCEROS → responsable obligatorio
   * -------------------------------------------------------- */
  validarResponsable(data, ctx);

  /* --------------------------------------------------------
   * 3) Validar invitados (solo formato, no capacidades)
   *   - Permite lista parcial
   *   - Mantiene esPiscina
   *   - Adulto es >= 12 años
   * -------------------------------------------------------- */
  validarInvitados(data, ctx);
});

export type CrearReservaType = z.infer<typeof crearReservaSchema>;
