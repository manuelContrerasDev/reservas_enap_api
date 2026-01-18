import { z } from "zod";

/* ============================================================
 * VALIDACIÓN — RESPONSABLE (shared rule)
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

  const isBlank = (v: unknown) =>
    typeof v !== "string" || v.trim().length === 0;

  const existeAlguno =
    !isBlank(data.nombreResponsable) ||
    !isBlank(data.rutResponsable) ||
    !isBlank(data.emailResponsable) ||
    !isBlank(data.telefonoResponsable);

  /* ================= SOCIO PRESENTE ================= */
  if (socioPresente) {
    if (existeAlguno) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puede existir responsable si el socio está presente",
        path: ["responsable"],
      });
    }
    return;
  }

  /* ================= SOCIO NO PRESENTE ================= */
  const faltanDatos =
    isBlank(data.nombreResponsable) ||
    isBlank(data.rutResponsable) ||
    isBlank(data.emailResponsable) ||
    isBlank(data.telefonoResponsable);

  if (faltanDatos) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debes completar todos los datos del responsable",
      path: ["responsable"],
    });
  }
};
