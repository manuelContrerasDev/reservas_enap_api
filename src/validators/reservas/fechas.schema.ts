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

  // 🔹 Aquí ya NO validamos cantidad de días (3-6)
  //     -> eso se resuelve en los services según tipo de espacio.

  // 1 = lunes (getDay): 0 Domingo, 1 Lunes, ...
  const diaInicio = inicio.getDay();
  if (diaInicio === 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de inicio no puede ser lunes (mantenimiento)",
      path: ["fechaInicio"],
    });
  }
};
