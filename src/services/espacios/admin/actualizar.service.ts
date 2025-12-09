// src/services/espacios/admin/actualizar.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { normalizeActualizarData, toEspacioDTO } from "../helpers";

export async function actualizarService(id: string, data: any) {
  const exists = await EspaciosRepository.findById(id);
  if (!exists) throw new Error("ESPACIO_NOT_FOUND");

  const payload = normalizeActualizarData(data, exists);

  const espacio = await EspaciosRepository.update(id, payload);
  return toEspacioDTO(espacio);
}
