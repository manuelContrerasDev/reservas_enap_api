// src/services/espacios/admin/toggle-activo.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { toEspacioDTO } from "../helpers";

export async function toggleActivoService(id: string) {
  const espacio = await EspaciosRepository.findById(id);
  if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

  const updated = await EspaciosRepository.toggle(id, espacio.activo);
  return toEspacioDTO(updated);
}
