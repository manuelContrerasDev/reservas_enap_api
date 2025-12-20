// src/validators/reservas/responsable.schema.ts
import { z } from "zod";

export const validarResponsable = (data: any, ctx: z.RefinementCtx) => {
  const usoReserva = data.usoReserva as
    | "USO_PERSONAL"
    | "CARGA_DIRECTA"
    | "TERCEROS"
    | undefined;

  const socioPresente: boolean =
    typeof data.socioPresente === "boolean" ? data.socioPresente : true;

  // Regla 1: si usoReserva = TERCEROS → el socio NO puede estar presente
  if (usoReserva === "TERCEROS" && socioPresente) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Si la reserva es para terceros, el socio no puede estar presente",
      path: ["socioPresente"],
    });
  }

  // Si el socio está presente → no exigimos responsable
  if (socioPresente) return;

  // Regla 2: si el socio NO está presente → responsable obligatorio
  const missing =
    !data.nombreResponsable ||
    !data.rutResponsable ||
    !data.emailResponsable ||
    !data.telefonoResponsable;

  if (missing) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debes completar los datos del responsable",
      path: ["nombreResponsable"],
    });
  }
};
