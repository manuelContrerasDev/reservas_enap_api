import { z } from "zod";
import { TipoEspacio } from "@prisma/client";

export const catalogoQuerySchema = z.object({
  search: z.string().trim().optional(),

  tipo: z.nativeEnum(TipoEspacio).optional(),

  capacidadMin: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),

  capacidadMax: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),

  order: z.enum(["asc", "desc"]).optional(),
});

export type CatalogoQueryDTO = z.infer<typeof catalogoQuerySchema>;
