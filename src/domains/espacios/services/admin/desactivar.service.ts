// src/services/espacios/admin/desactivar.service.ts

import { EspaciosRepository } from "../../../repositories/espacios/espacios.repository";
import { toEspacioDTO } from "../../../domains/espacios/mappers/espacioDTO";

/**
 * Desactivar espacio (ADMIN)
 * - Soft delete real del dominio
 * - Oculta del catálogo
 * - Bloquea nuevas reservas
 * - No elimina historial
 */
export async function desactivarService(id: string) {
  const espacio = await EspaciosRepository.findById(id);

  if (!espacio) {
    throw new Error("ESPACIO_NOT_FOUND");
  }

  // 🔒 Idempotencia: si ya está desactivado, no hacemos nada
  if (!espacio.activo && !espacio.visible) {
    return toEspacioDTO(espacio);
  }

  const updated = await EspaciosRepository.softDelete(id);

  return toEspacioDTO(updated);
}
