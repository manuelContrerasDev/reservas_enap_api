import { z } from "zod";

/**
 * Cancelación por SOCIO / EXTERNO
 * Solo permitido en estado PENDIENTE_PAGO
 */
export const cancelarReservaSchema = z
  .object({
    motivo: z
      .string()
      .trim()
      .min(3, "Motivo demasiado corto")
      .max(200, "Motivo demasiado largo")
      .optional(),
  })
  .strict();

export type CancelarReservaInput = z.infer<
  typeof cancelarReservaSchema
>;
