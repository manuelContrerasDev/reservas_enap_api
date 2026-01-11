import { z } from "zod";

export const cancelarReservaAdminSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(3, "Motivo demasiado corto")
    .max(200, "Motivo demasiado largo")
    .optional(),
});

export type CancelarReservaAdminType = z.infer<typeof cancelarReservaAdminSchema>;
