// src/validators/reservas/filtros-admin.schema.ts

import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const adminReservasQuerySchema = z.object({
  estado: z
    .string()
    .optional()
    .refine((v) => !v || v === "TODOS" || Object.values(ReservaEstado).includes(v as any), {
      message: "Estado inválido",
    }),

  espacioId: z.string().uuid().optional(),

  socioId: z.string().optional(), // búsqueda texto

  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),

  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),

  sort: z.enum(["fechaInicio", "fechaFin", "estado", "totalClp"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type AdminReservasQueryType = z.infer<typeof adminReservasQuerySchema>;
