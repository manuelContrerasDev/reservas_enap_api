import { z } from "zod";

export const rechazarPagoSchema = z
  .object({
    motivo: z
      .string()
      .trim()
      .min(5, "Motivo requerido (mín. 5 caracteres)")
      .max(500, "Motivo demasiado largo (máx. 500 caracteres)"),
  })
  .strict();

export type RechazarPagoInput = z.infer<typeof rechazarPagoSchema>;
