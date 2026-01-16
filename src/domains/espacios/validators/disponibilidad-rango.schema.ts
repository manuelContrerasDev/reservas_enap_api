// src/validators/espacios/disponibilidad-rango.schema.ts
import { z } from "zod";
import { differenceInCalendarDays } from "date-fns";

export const disponibilidadRangoSchema = z
  .object({
    fechaInicio: z.string().refine(
      (v) => !Number.isNaN(new Date(v).getTime()),
      { message: "fechaInicio inválida" }
    ),
    fechaFin: z.string().refine(
      (v) => !Number.isNaN(new Date(v).getTime()),
      { message: "fechaFin inválida" }
    ),
  })
  .superRefine(({ fechaInicio, fechaFin }, ctx) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    if (fin < inicio) {
      ctx.addIssue({
        path: ["fechaFin"],
        message: "fechaFin no puede ser anterior a fechaInicio",
        code: z.ZodIssueCode.custom,
      });
      return;
    }

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    if (dias < 3) {
      ctx.addIssue({
        path: ["fechaFin"],
        message: "La reserva debe ser de al menos 3 días",
        code: z.ZodIssueCode.custom,
      });
    }

    if (dias > 6) {
      ctx.addIssue({
        path: ["fechaFin"],
        message: "La reserva no puede exceder 6 días",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type DisponibilidadRangoType = z.infer<
  typeof disponibilidadRangoSchema
>;
