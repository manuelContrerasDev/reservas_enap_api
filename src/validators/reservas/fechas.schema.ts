// src/validators/reservas/fechas.schema.ts
import { z } from "zod";

export const validarRangoFechas = (data: any, ctx: z.RefinementCtx) => {
  const inicio = new Date(data.fechaInicio);
  const fin = new Date(data.fechaFin);

  // Fecha inválida (no es string ISO válida)
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

  // Fecha final debe ser mayor
  if (fin <= inicio) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de término debe ser posterior a la fecha de inicio",
      path: ["fechaFin"],
    });
  }
};
