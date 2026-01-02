// src/services/espacios/socio/disponibilidad.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";

export async function disponibilidadService(id: string) {
  // El espacio debe existir (aunque esté inactivo u oculto)
  const espacio = await EspaciosRepository.findById(id);

  if (!espacio) {
    throw new Error("ESPACIO_NOT_FOUND");
  }

  const fechas = await EspaciosRepository.findReservasActivasPorEspacio(id);

  // ⚠️ Mantiene contrato actual del frontend
  return {
    id,
    fechas,
  };
}
