// src/services/espacios/socio/detalle.service.ts

import { EspaciosRepository } from "../../../repositories/espacios/espacios.repository";
import { toEspacioDTO } from "../../mappers/espacioDTO";

export async function detalleService(id: string) {
  const espacio = await EspaciosRepository.findPublicById(id);

  if (!espacio) {
    throw new Error("ESPACIO_NOT_FOUND");
  }

  return toEspacioDTO(espacio);
}
