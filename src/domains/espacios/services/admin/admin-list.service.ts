// src/services/espacios/admin/admin-list.service.ts

import { EspaciosRepository } from "../../../repositories/espacios/espacios.repository";
import { toEspacioDTO } from "../../../domains/espacios/mappers/espacioDTO";

/**
 * Listado completo de espacios (ADMIN)
 * - Incluye activos, inactivos y ocultos
 * - Ordenado por nombre
 */
export async function adminListService() {
  const espacios = await EspaciosRepository.findMany(
    {}, // sin filtros intencionalmente
    { nombre: "asc" }
  );

  return Array.isArray(espacios)
    ? espacios.map(toEspacioDTO)
    : [];
}
