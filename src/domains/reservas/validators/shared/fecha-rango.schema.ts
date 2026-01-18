import { z } from "zod";

export const fechaISO = z
  .string()
  .datetime({ message: "Fecha inválida" });

export const rangoFechasSchema = z
  .object({
    fechaInicio: fechaISO,
    fechaFin: fechaISO,
  })
  .superRefine((data, ctx) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);

    if (fin <= inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de término debe ser posterior a la de inicio",
        path: ["fechaFin"],
      });
    }

    // Regla ENAP: lunes no permitido
    if (inicio.getDay() === 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de inicio no puede ser lunes (mantenimiento)",
        path: ["fechaInicio"],
      });
    }
  });
