// src/domains/espacios/contrato/admin/validators/visibilidad.schema.ts
import { z } from "zod";

export const visibilidadSchema = z.object({
  visible: z.boolean(),
});
