import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

const reservaEstados = Object.values(ReservaEstado) as [
  ReservaEstado,
  ...ReservaEstado[]
];

export const adminReservasQuerySchema = z.object({
  estado: z.enum(["TODOS", ...reservaEstados]).optional(),

  espacioId: z.string().uuid().optional(),

  // búsqueda libre por socio / responsable / email / teléfono
  socio: z.string().optional(),

  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),

  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),

  sort: z
    .enum(["fechaInicio", "fechaFin", "estado", "totalClp", "nombreSocio"])
    .optional(),

  order: z.enum(["asc", "desc"]).optional(),
});

export type AdminReservasQuery =
  z.infer<typeof adminReservasQuerySchema>;
