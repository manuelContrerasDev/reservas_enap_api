import { z } from "zod";

export const aprobarPagoSchema = z.object({
  monto: z.number().int().positive().optional(),
  referencia: z.string().min(1).optional(),
  nota: z.string().min(1).optional(),
});

export type AprobarPagoInput = z.infer<typeof aprobarPagoSchema>;
