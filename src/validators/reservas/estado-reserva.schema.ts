import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const actualizarEstadoSchema = z.object({
  estado: z.enum(
    Object.values(ReservaEstado),
    {
      message: "Estado inválido"
    }
  ),
});

export type ActualizarEstadoType = z.infer<typeof actualizarEstadoSchema>;
