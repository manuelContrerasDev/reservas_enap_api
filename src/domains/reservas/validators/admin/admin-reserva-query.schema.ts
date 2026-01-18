import { z } from "zod";
import { ReservaEstado } from "@prisma/client";
import { fechaISO } from "../shared/fecha-rango.schema";

export const adminReservasQuerySchema = z
  .object({
    estado: z.union([z.literal("TODOS"), z.nativeEnum(ReservaEstado)]).optional(),

    espacioId: z.string().uuid().optional(),

    // búsqueda libre por socio / responsable / email / teléfono
    socio: z.string().trim().min(1).optional(),

    fechaInicio: fechaISO.optional(),
    fechaFin: fechaISO.optional(),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    sort: z
      .enum(["fechaInicio", "fechaFin", "estado", "totalClp", "nombreSocio"])
      .default("fechaInicio"),

    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.fechaInicio && data.fechaFin) {
      const inicio = new Date(data.fechaInicio);
      const fin = new Date(data.fechaFin);

      if (fin < inicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "fechaFin debe ser posterior o igual a fechaInicio",
          path: ["fechaFin"],
        });
      }
    }
  });

export type AdminReservasQuery = z.infer<typeof adminReservasQuerySchema>;
