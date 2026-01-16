// src/validators/pagos.schema.ts
import { z } from "zod";

/* ============================================================
 * 1. Crear intento de pago → /api/pagos/checkout
 * ============================================================*/
export const CrearPagoSchema = z.object({
  reservaId: z.string().uuid("reservaId debe ser un UUID válido"),
});

export type CrearPagoInput = z.infer<typeof CrearPagoSchema>;

/* ============================================================
 * 2. Webpay notificación (post-back del front)
 *    /api/pagos/webpay/notificacion
 * ============================================================*/
export const WebpayNotificationSchema = z
  .object({
    token_ws: z.string().optional(),
    TBK_TOKEN: z.string().optional(),
  })
  .refine(
    (data) => data.token_ws || data.TBK_TOKEN,
    "Debe venir token_ws o TBK_TOKEN"
  );

export type WebpayNotificationInput = z.infer<
  typeof WebpayNotificationSchema
>;
