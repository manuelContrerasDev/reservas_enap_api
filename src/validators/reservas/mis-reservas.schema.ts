import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

/**
 * TODO (Pack futuro): habilitar paginación/filtro en /mis-reservas
 * - En route: validateQuery(misReservasQuerySchema)
 * - En controller: leer req.validatedQuery
 * - En repo: aplicar skip/take + where estado
 */
export const misReservasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  estado: z.nativeEnum(ReservaEstado).optional(),
});

export type MisReservasQuery = z.infer<typeof misReservasQuerySchema>;
