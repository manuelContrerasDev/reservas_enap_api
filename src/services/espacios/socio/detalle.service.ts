// src/services/espacios/socio/detalle.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { toEspacioDTO } from "../helpers";

export async function detalleService(id: string) {
  const espacio = await EspaciosRepository.findById(id);

  if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

  return toEspacioDTO(espacio);
}
