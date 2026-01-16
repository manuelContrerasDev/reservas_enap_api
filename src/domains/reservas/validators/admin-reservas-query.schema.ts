import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const adminReservasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),

  estado: z
    .union([z.nativeEnum(ReservaEstado), z.literal("TODOS")])
    .optional(),

  espacioId: z.string().uuid().optional(),

  socio: z.string().trim().min(2).optional(),

  fechaInicio: z
    .string()
    .refine(v => !isNaN(new Date(v).getTime()), {
      message: "FECHA_INVALIDA",
    })
    .optional(),

  fechaFin: z
    .string()
    .refine(v => !isNaN(new Date(v).getTime()), {
      message: "FECHA_INVALIDA",
    })
    .optional(),

  sort: z
    .enum(["fechaInicio", "createdAt", "estado"])
    .default("fechaInicio"),

  order: z.enum(["asc", "desc"]).default("desc"),
});

export type AdminReservasQuery = z.infer<
  typeof adminReservasQuerySchema
>;
