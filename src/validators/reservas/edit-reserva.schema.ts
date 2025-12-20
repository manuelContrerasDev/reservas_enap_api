// src/validators/reservas/edit-reserva.schema.ts
import { z } from "zod";
import { validarRangoFechas } from "./fechas.schema";
import { validarResponsable } from "./responsable.schema";
import { validarInvitados } from "./invitados.schema";

export const editReservaSchema = z
  .object({
    nombreSocio: z.string().min(3).optional(),
    rutSocio: z.string().min(5).optional(),
    telefonoSocio: z.string().min(5).optional(),
    correoEnap: z.string().email().optional(),
    correoPersonal: z.string().email().optional(),

    socioPresente: z.boolean().optional(),

    nombreResponsable: z.string().optional(),
    rutResponsable: z.string().optional(),
    emailResponsable: z.string().email().optional(),
    telefonoResponsable: z.string().min(5).optional(),

    invitados: z
      .array(
        z.object({
          nombre: z.string().min(2),
          rut: z.string().min(5),
          edad: z.number().int().min(0).optional(),
          esPiscina: z.boolean().optional().default(false),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    validarResponsable(data, ctx);
    if (data.invitados) validarInvitados(data, ctx);
  });



export type EditReservaType = z.infer<typeof editReservaSchema>;
