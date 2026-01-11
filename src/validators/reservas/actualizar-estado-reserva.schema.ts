import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const actualizarEstadoSchema = z.object({
  estado: z.nativeEnum(ReservaEstado, {
    message: "Estado inválido",
  }),
});

export type ActualizarEstadoType = z.infer<typeof actualizarEstadoSchema>;
