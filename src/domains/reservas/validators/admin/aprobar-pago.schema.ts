import { z } from "zod";

export const aprobarPagoSchema = z
  .object({
    monto: z.number().int().positive().optional(),
    referencia: z.string().trim().min(1).optional(),
    nota: z.string().trim().min(1).optional(),
  })
  .strict();

export type AprobarPagoInput = z.infer<typeof aprobarPagoSchema>;
