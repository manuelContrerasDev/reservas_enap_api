import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const actualizarEstadoReservaSchema = z.object({
  estado: z.nativeEnum(ReservaEstado, {
    message: "ESTADO_INVALIDO",
  }),
});

export type ActualizarEstadoReservaInput = z.infer<
  typeof actualizarEstadoReservaSchema
>;
