import { z } from "zod";
import { fechaISO } from "./shared/fecha-rango.schema";

export const piscinaFechaSchema = z
  .object({
    fecha: fechaISO,
  })
  .strict()
  .superRefine((data, ctx) => {
    const fecha = new Date(data.fecha);

    // Lunes = 1
    if (fecha.getDay() === 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La piscina no está disponible los lunes (mantenimiento)",
        path: ["fecha"],
      });
    }
  });

export type PiscinaFechaInput = z.infer<typeof piscinaFechaSchema>;
