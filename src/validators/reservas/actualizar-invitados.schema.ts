// src/validators/reservas/actualizar-invitados.schema.ts

import { z } from "zod";

export const actualizarInvitadosSchema = z.object({
  invitados: z
    .array(
      z.object({
        nombre: z
          .string()
          .min(2, "El nombre del invitado es demasiado corto"),

        rut: z
          .string()
          .min(5, "El RUT del invitado es inválido"),

        edad: z
          .number()
          .int("La edad debe ser un número entero")
          .min(0, "Edad inválida")
          .optional(),
      })
    )
    .optional()
    .refine(
      (arr) => !arr || arr.length > 0,
      "Si envías invitados, debe contener al menos un elemento"
    ),
});

export type ActualizarInvitadosType = z.infer<typeof actualizarInvitadosSchema>;
