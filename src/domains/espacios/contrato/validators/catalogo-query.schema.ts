// src/domains/espacios/contrato/validators/catalogo-query.schema.ts
import { z } from "zod";
import { UsoReserva } from "@prisma/client";

export const catalogoContratoQuerySchema = z.object({
  usoReserva: z.nativeEnum(UsoReserva).optional(),
});
