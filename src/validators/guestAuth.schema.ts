// src/validators/guestAuth.schema.ts
import { z } from "zod";

export const createGuestAuthSchema = z.object({
  email: z
    .string()
    .min(1, "Correo del invitado requerido")
    .email("Email inválido"),

  name: z
    .string()
    .min(2, "Nombre muy corto")
    .max(80, "Nombre demasiado largo")
    .optional(),
});

export type CreateGuestAuthType = z.infer<typeof createGuestAuthSchema>;

export const deleteGuestAuthSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type DeleteGuestAuthType = z.infer<typeof deleteGuestAuthSchema>;
