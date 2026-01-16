// src/services/espacios/socio/disponibilidad.service.ts
import { DisponibilidadEspacioRepository } from "../../../repositories/espacios";
import { TipoEspacio } from "@prisma/client";

export const DisponibilidadEspacioService = {
  async ejecutar(espacioId: string, fechaInicioISO: string, fechaFinISO: string) {
    const inicio = new Date(fechaInicioISO);
    const fin = new Date(fechaFinISO);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }

    // Normalizamos rango día completo
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    if (inicio > fin) {
      throw new Error("RANGO_INVALIDO");
    }

    const espacio = await DisponibilidadEspacioRepository.obtenerEspacio(espacioId);

    if (!espacio || !espacio.activo) throw new Error("ESPACIO_NO_DISPONIBLE");

    if (espacio.tipo !== TipoEspacio.CABANA && espacio.tipo !== TipoEspacio.QUINCHO) {
      throw new Error("TIPO_NO_SOPORTADO");
    }

    const totalUnidades = espacio.capacidad;
    if (!totalUnidades || totalUnidades <= 0) throw new Error("CAPACIDAD_NO_CONFIGURADA");

    const ocupadas = await DisponibilidadEspacioRepository.contarReservasSolapadas(
      espacioId,
      inicio,
      fin
    );

    const disponibles = Math.max(0, totalUnidades - ocupadas);

    return {
      espacioId,
      tipo: espacio.tipo,
      totalUnidades,
      ocupadas,
      disponibles,
      disponible: disponibles > 0,
    };
  },
};
