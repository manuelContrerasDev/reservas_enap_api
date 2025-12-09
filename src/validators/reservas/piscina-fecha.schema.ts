// src/validators/reservas/piscina-fecha.schema.ts
import { z } from "zod";

export const piscinaFechaSchema = z.object({
  fecha: z
    .string()
    .min(5, "La fecha es requerida")
    .refine((v) => !isNaN(new Date(v).getTime()), {
      message: "Fecha inválida",
    }),
});

export type PiscinaFechaType = z.infer<typeof piscinaFechaSchema>;
