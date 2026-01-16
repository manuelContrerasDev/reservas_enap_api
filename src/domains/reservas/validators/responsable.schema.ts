import { z } from "zod";

/* ============================================================
 * VALIDACIÓN BACKEND — RESPONSABLE
 *
 * Contexto:
 * - Usado SOLO en edición de reserva
 * - socioPresente es un flag transitorio (NO persistente)
 *
 * Reglas:
 * 1. socioPresente = true
 *    → NO puede existir responsable
 *
 * 2. socioPresente = false
 *    → responsable COMPLETO es obligatorio
 * ============================================================ */
export const validarResponsable = (
  data: {
    socioPresente?: boolean;
    nombreResponsable?: string | null;
    rutResponsable?: string | null;
    emailResponsable?: string | null;
    telefonoResponsable?: string | null;
  },
  ctx: z.RefinementCtx
) => {
  const socioPresente =
    typeof data.socioPresente === "boolean" ? data.socioPresente : true;

  /* ================= SOCIO PRESENTE ================= */
  if (socioPresente) {
    const existeResponsable =
      data.nombreResponsable ||
      data.rutResponsable ||
      data.emailResponsable ||
      data.telefonoResponsable;

    if (existeResponsable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "No puede existir responsable si el socio está presente",
        path: ["socioPresente"],
      });
    }

    return;
  }

  /* ================= SOCIO NO PRESENTE ================= */
  const faltanDatos =
    !data.nombreResponsable ||
    !data.rutResponsable ||
    !data.emailResponsable ||
    !data.telefonoResponsable;

  if (faltanDatos) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Debes completar todos los datos del responsable",
      path: ["nombreResponsable"],
    });
  }
};
