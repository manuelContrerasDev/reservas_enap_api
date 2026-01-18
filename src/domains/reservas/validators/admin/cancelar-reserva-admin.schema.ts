import { z } from "zod";

/**
 * Anulación administrativa
 * Solo permitido en estado PENDIENTE_PAGO
 * Motivo OBLIGATORIO
 */
export const cancelarReservaAdminSchema = z
  .object({
    motivo: z
      .string()
      .trim()
      .min(5, "Motivo requerido (mín. 5 caracteres)")
      .max(500, "Motivo demasiado largo (máx. 500 caracteres)"),
  })
  .strict();

export type CancelarReservaAdminInput = z.infer<
  typeof cancelarReservaAdminSchema
>;
