// src/services/espacios/admin/eliminar.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";

export async function eliminarService(id: string) {
  const exists = await EspaciosRepository.findById(id);
  if (!exists) throw new Error("ESPACIO_NOT_FOUND");

  await EspaciosRepository.delete(id);
  return { ok: true };
}
