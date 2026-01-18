import { z } from "zod";
import { rutSchema } from "./rut.schema";

export const actualizarInvitadosSchema = z
  .object({
    invitados: z
      .array(
        z.object({
          id: z.string().uuid().optional(),

          nombre: z.string().trim().min(2, "El nombre es demasiado corto"),
          rut: rutSchema,

          edad: z.number().int().min(0, "Edad inválida").nullable().optional(),
          esPiscina: z.boolean().optional().default(false),
        }).strict()
      )
      .min(1, "Debe ingresar al menos un invitado"),
  })
  .strict();

export type ActualizarInvitadosType = z.infer<
  typeof actualizarInvitadosSchema
>;
