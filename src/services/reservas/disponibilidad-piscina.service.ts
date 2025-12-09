// src/services/reservas/disponibilidad-piscina.service.ts

import { PiscinaRepository } from "../../repositories/reservas";

export const DisponibilidadPiscinaService = {
  async ejecutar(fechaISO: string) {
    if (!fechaISO) throw new Error("FECHA_REQUERIDA");

    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) throw new Error("FECHA_INVALIDA");

    const reservas = await PiscinaRepository.reservasPorFecha(fecha);

    const capacidadMax = 80;
    const reservado = reservas.reduce(
      (acc, r) => acc + r.cantidadPersonas,
      0
    );

    return {
      fecha: fechaISO,
      capacidadMax,
      reservado,
      disponible: Math.max(0, capacidadMax - reservado),
    };
  },
};
