// src/validators/reservas/subir-comprobante.schema.ts
import { z } from "zod";

export const subirComprobanteSchema = z.object({
  comprobanteUrl: z.string().url(),
  comprobanteName: z.string().min(1),
  comprobanteMime: z.string().min(1),
  comprobanteSize: z.number().int().positive(),
});

export type SubirComprobanteType = z.infer<typeof subirComprobanteSchema>;
