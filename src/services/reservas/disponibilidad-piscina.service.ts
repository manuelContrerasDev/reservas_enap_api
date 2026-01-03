// src/services/reservas/disponibilidad-piscina.service.ts

import { PiscinaRepository } from "../../repositories/reservas";

export const DisponibilidadPiscinaService = {
  async ejecutar(fechaISO: string) {
    if (!fechaISO) throw new Error("FECHA_REQUERIDA");

    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) throw new Error("FECHA_INVALIDA");

    fecha.setHours(0, 0, 0, 0);

    const espacio = await PiscinaRepository.obtenerEspacioPiscina();
    if (!espacio) throw new Error("ESPACIO_PISCINA_NO_CONFIGURADO");

    const reservas = await PiscinaRepository.reservasPorDia(fecha);

    const reservado = reservas.reduce(
      (acc, r) => acc + (r.cantidadPiscina ?? 0),
      0
    );

    const capacidadTotal = espacio.capacidad ?? 80;
    const capacidadDisponible = Math.max(0, capacidadTotal - reservado);

    return {
      fecha: fechaISO,
      capacidadTotal,
      reservado,
      capacidadDisponible,
      disponible: capacidadDisponible > 0,
    };
  },
};
