// src/services/espacios/admin/eliminar.service.ts

import { EspaciosRepository } from "../../../repositories/espacios/espacios.repository";
import { toEspacioDTO } from "../../../domains/espacios/mappers/espacioDTO";

/**
 * Eliminar espacio (ADMIN)
 * ⚠️ NO elimina físicamente
 * - Equivale a soft-delete
 * - Retira del catálogo
 * - Bloquea nuevas reservas
 * - Mantiene historial
 */
export async function eliminarService(id: string) {
  const espacio = await EspaciosRepository.findById(id);

  if (!espacio) {
    throw new Error("ESPACIO_NOT_FOUND");
  }

  // 🔒 Idempotente: si ya está eliminado, no repetir acción
  if (!espacio.activo && !espacio.visible) {
    return toEspacioDTO(espacio);
  }

  const updated = await EspaciosRepository.softDelete(id);

  return toEspacioDTO(updated);
}
