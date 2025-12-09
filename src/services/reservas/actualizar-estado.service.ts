// src/services/reservas/actualizar-estado.service.ts

import {
  ReservasAdminRepository,
} from "../../repositories/reservas";
import { ReservaEstado } from "@prisma/client";

export const ActualizarEstadoReservaService = {
  async ejecutar(id: string, estado: any) {
    if (!estado) throw new Error("ESTADO_REQUERIDO");

    if (!Object.values(ReservaEstado).includes(estado as any))
      throw new Error("ESTADO_INVALIDO");

    return ReservasAdminRepository.actualizarEstado(id, estado);
  },
};
