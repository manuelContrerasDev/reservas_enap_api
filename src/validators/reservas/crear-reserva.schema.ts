// src/validators/reservas/crear-reserva.schema.ts

import { z } from "zod";
import { baseReservaSchema } from "./base-reserva.schema";
import { validarRangoFechas } from "./fechas.schema";
import { validarResponsable } from "./responsable.schema";
import { validarInvitados } from "./invitados.schema";

export const crearReservaSchema = baseReservaSchema.superRefine((data, ctx) => {
  validarRangoFechas(data, ctx);
  validarResponsable(data, ctx);
  validarInvitados(data, ctx);
});

export type CrearReservaType = z.infer<typeof crearReservaSchema>;
