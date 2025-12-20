// src/validators/reservas/filtros-admin.schema.ts
import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const adminReservasQuerySchema = z.object({
  estado: z
    .string()
    .optional()
    .refine(
      v => !v || v === "TODOS" || Object.values(ReservaEstado).includes(v as any),
      {
        message: "Estado inválido",
      }
    ),

  espacioId: z.string().uuid().optional(),

  // 👇 nombre del campo sincronizado con el service (socio)
  socio: z.string().optional(), // búsqueda texto libre

  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),

  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),

  // añadimos nombreSocio, que el service ya soporta
  sort: z
    .enum(["fechaInicio", "fechaFin", "estado", "totalClp", "nombreSocio"])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type AdminReservasQueryType = z.infer<typeof adminReservasQuerySchema>;
