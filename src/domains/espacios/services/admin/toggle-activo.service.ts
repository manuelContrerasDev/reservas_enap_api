// src/services/espacios/admin/toggle-activo.service.ts

import { EspaciosRepository } from "@/domains/espacios/repositories/espacios.repository";
import { toEspacioDTO } from "@/domains/espacios/mappers/espacioDTO";

/**
 * Toggle activo (ADMIN)
 * - Activa / desactiva disponibilidad
 * - NO modifica visibilidad
 * - No reactiva espacios ocultos
 */
export async function toggleActivoService(id: string) {
  const espacio = await EspaciosRepository.findById(id);

  if (!espacio) {
    throw new Error("ESPACIO_NOT_FOUND");
  }

  // 🔒 Regla de dominio:
  // No permitir activar espacios ocultos (soft-deleted)
  if (!espacio.visible && !espacio.activo) {
    throw new Error("ESPACIO_OCULTO");
  }

  const updated = await EspaciosRepository.toggle(id, espacio.activo);

  return toEspacioDTO(updated);
}
