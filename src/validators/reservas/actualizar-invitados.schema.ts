// src/validators/reservas/actualizar-invitados.schema.ts
import { z } from "zod";

export const actualizarInvitadosSchema = z.object({
  invitados: z.array(
    z.object({
      id: z.string().uuid().optional(),
      nombre: z.string().trim().min(2, "El nombre es demasiado corto"),
      rut: z.string().trim().min(3, "RUT inválido"),
      edad: z.number().int().min(0, "Edad inválida").optional(),
      esPiscina: z.boolean().optional().default(false),
    })
  ),
});

export type ActualizarInvitadosType = z.infer<typeof actualizarInvitadosSchema>;
