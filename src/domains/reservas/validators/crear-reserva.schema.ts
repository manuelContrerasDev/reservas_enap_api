import { z } from "zod";
import { baseReservaSchema } from "./base-reserva.schema";
import { validarResponsable } from "./responsable.schema";

export const crearReservaSchema = baseReservaSchema.superRefine(
  (data, ctx) => {
    validarResponsable(data, ctx);
  }
);

export type CrearReservaType = z.infer<typeof crearReservaSchema>;
