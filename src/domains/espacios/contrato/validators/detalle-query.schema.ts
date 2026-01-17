// src/domains/espacios/contrato/validators/detalle-query.schema.ts
import { z } from "zod";

export const detalleContratoQuerySchema = z.object({
  desde: z.string().min(10),
  hasta: z.string().min(10),
});
