// src/validators/reservas/actualizar-estado-reserva.schema.ts

import { z } from "zod";
import { ReservaEstado } from "@prisma/client";

export const actualizarEstadoSchema = z.object({
  estado: z.nativeEnum(ReservaEstado),
});

export type ActualizarEstadoType = z.infer<typeof actualizarEstadoSchema>;
