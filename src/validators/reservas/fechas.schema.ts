// src/validators/reservas/fechas.schema.ts
import { z } from "zod";

export const validarRangoFechas = (data: any, ctx: z.RefinementCtx) => {
  const inicio = new Date(data.fechaInicio);
  const fin = new Date(data.fechaFin);

  if (isNaN(inicio.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Fecha de inicio inválida",
      path: ["fechaInicio"],
    });
    return;
  }

  if (isNaN(fin.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Fecha de término inválida",
      path: ["fechaFin"],
    });
    return;
  }

  if (fin <= inicio) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de término debe ser posterior a la de inicio",
      path: ["fechaFin"],
    });
    return;
  }

  // ⚠️ Regla de días mínimos/máximos se valida en services
  if (inicio.getDay() === 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de inicio no puede ser lunes (mantenimiento)",
      path: ["fechaInicio"],
    });
  }
};
