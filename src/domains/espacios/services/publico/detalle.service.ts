// src/services/espacios/socio/detalle.service.ts

import { EspaciosRepository } from "@/domains/espacios/repositories/espacios.repository";
import { toEspacioDTO } from "@/domains/espacios/mappers/espacioDTO";

export async function detalleService(id: string) {
  const espacio = await EspaciosRepository.findPublicById(id);

  if (!espacio) {
    throw new Error("ESPACIO_NOT_FOUND");
  }

  return toEspacioDTO(espacio);
}
