import { z } from "zod";
import { rutSchema } from "./rut.schema";

export const invitadoSchema = z
  .object({
    nombre: z.string().trim().min(1, "Nombre requerido"),
    rut: rutSchema,
    edad: z.number().int().min(0).nullable().optional(),
    esPiscina: z.boolean().optional().default(false),
  })
  .strict();

export const invitadosArraySchema = z
  .array(invitadoSchema)
  .default([]);
