// src/services/reservas/obtener.service.ts

import { ReservasReadRepository } from "../../repositories/reservas";

export const ObtenerReservaService = {
  async ejecutar(id: string) {
    const reserva = await ReservasReadRepository.detalle(id);

    if (!reserva) throw new Error("NOT_FOUND");

    return reserva;
  }
};
