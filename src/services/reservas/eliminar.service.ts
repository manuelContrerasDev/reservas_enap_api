// src/services/reservas/eliminar.service.ts

import {
  ReservasDeleteRepository,
} from "../../repositories/reservas";

export const EliminarReservaService = {
  async ejecutar(id: string) {
    const existe = await ReservasDeleteRepository.existe(id);
    if (!existe) throw new Error("NOT_FOUND");

    await ReservasDeleteRepository.eliminarInvitados(id);
    await ReservasDeleteRepository.eliminarPago(id);
    await ReservasDeleteRepository.eliminarReserva(id);
  },
};
