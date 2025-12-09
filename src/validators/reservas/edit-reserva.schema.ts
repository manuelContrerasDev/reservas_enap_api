// src/validators/reservas/edit-reserva.schema.ts

import { z } from "zod";
import { validarRangoFechas } from "./fechas.schema";
import { validarResponsable } from "./responsable.schema";
import { validarInvitados } from "./invitados.schema";

export const editReservaSchema = z
  .object({
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),

    cantidadPersonas: z.number().int().positive().optional(),
    cantidadPersonasPiscina: z.number().int().min(0).optional(),

    nombreSocio: z.string().min(3).optional(),
    rutSocio: z.string().min(5).optional(),
    telefonoSocio: z.string().min(5).optional(),
    correoEnap: z.string().email().optional(),
    correoPersonal: z.string().email().optional(),

    usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]).optional(),

    socioPresente: z.boolean().optional(),

    nombreResponsable: z.string().optional(),
    rutResponsable: z.string().optional(),
    emailResponsable: z.string().email().optional(),

    invitados: z
      .array(
        z.object({
          nombre: z.string().min(2),
          rut: z.string().min(5),
          edad: z.number().int().min(0).optional(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validaciones condicionales: solo si ambos existen
    if (data.fechaInicio && data.fechaFin) {
      validarRangoFechas(data, ctx);
    }

    if (data.socioPresente === false) {
      validarResponsable(data, ctx);
    }

    if (data.invitados) {
      validarInvitados(data, ctx);
    }
  });

export type EditReservaType = z.infer<typeof editReservaSchema>;
