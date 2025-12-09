// src/services/espacios/admin/crear.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { normalizeCrearData, toEspacioDTO } from "../helpers";

export async function crearService(data: any) {
  const payload = normalizeCrearData(data);
  const espacio = await EspaciosRepository.create(payload);
  return toEspacioDTO(espacio);
}
