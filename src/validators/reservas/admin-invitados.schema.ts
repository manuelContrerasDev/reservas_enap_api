// src/validators/reservas/admin-invitados.schema.ts
import { z } from "zod";
import { validarInvitados } from "./invitados.schema";

export const adminInvitadosSchema = z
  .object({
    invitados: z.array(
      z.object({
        nombre: z.string(),
        rut: z.string(),
        edad: z.number().optional(),
        esPiscina: z.boolean().optional(),
      })
    ),
  })
  .superRefine(validarInvitados);

export type AdminInvitadosRequest = z.infer<
  typeof adminInvitadosSchema
>;
