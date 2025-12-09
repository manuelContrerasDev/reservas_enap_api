// src/validators/reservas/responsable.schema.ts
import { z } from "zod";

export const validarResponsable = (data: any, ctx: z.RefinementCtx) => {
  if (data.socioPresente) return; // No requiere responsable

  const faltanCampos =
    !data.nombreResponsable ||
    !data.rutResponsable ||
    !data.emailResponsable;

  if (faltanCampos) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debes completar los datos del responsable",
      path: ["nombreResponsable"], // Se marca el primer campo
    });
  }
};
