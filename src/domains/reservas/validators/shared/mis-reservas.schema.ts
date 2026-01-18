import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const misReservasQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    estado: z.nativeEnum(ReservaEstado).optional(),
  })
  .strict();

export type MisReservasQuery = z.infer<typeof misReservasQuerySchema>;
