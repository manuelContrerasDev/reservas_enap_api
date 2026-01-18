import { z } from "zod";

export const adminConfirmarReservaSchema = z
  .object({
    confirmar: z.literal(true),
  })
  .strict();

export type AdminConfirmarReservaInput = z.infer<
  typeof adminConfirmarReservaSchema
>;
