import { z } from "zod";

export const subirComprobanteSchema = z
  .object({
    comprobanteUrl: z.string().url(),
    comprobanteName: z.string().trim().min(1),
    comprobanteMime: z.string().trim().min(1),

    comprobanteSize: z
      .number()
      .int()
      .positive()
      .max(5 * 1024 * 1024, "El comprobante no puede superar los 5MB"),
  })
  .strict();

export type SubirComprobanteType = z.infer<typeof subirComprobanteSchema>;
