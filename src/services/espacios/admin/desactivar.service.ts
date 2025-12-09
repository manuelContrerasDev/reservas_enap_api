// src/services/espacios/admin/desactivar.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { toEspacioDTO } from "../helpers";

export async function desactivarService(id: string) {
  const exists = await EspaciosRepository.findById(id);
  if (!exists) throw new Error("ESPACIO_NOT_FOUND");

  const updated = await EspaciosRepository.softDelete(id);
  return toEspacioDTO(updated);
}
