// src/services/espacios/base/obtener-espacios-activos.service.ts

import { EspaciosRepository } from "@/domains/espacios/repositories/espacios.repository";
import { Prisma, Espacio } from "@prisma/client";

/* ============================================================
 * Tipos
 * ============================================================ */

export interface ObtenerEspaciosActivosParams {
  /**
   * Filtros adicionales al dominio base (NO sobrescriben activo/visible)
   */
  where?: Prisma.EspacioWhereInput;

  /**
   * Ordenamiento permitido
   */
  orderBy?: Prisma.EspacioOrderByWithRelationInput;
}

/* ============================================================
 * Constantes de dominio (fuente única de verdad)
 * ============================================================ */

/**
 * Regla base de visibilidad pública:
 * - Solo espacios activos
 * - Solo espacios visibles
 */
const BASE_WHERE: Prisma.EspacioWhereInput = {
  activo: true,
  visible: true,
};

/* ============================================================
 * Service
 * ============================================================ */

/**
 * 🔒 Servicio base para obtener espacios visibles en frontend
 *
 * ✔ SOCIO / EXTERNO
 * ✔ Catálogo legacy
 * ✔ Catálogo por productos
 * ✔ Disponibilidad agregada
 *
 * ❌ No calcula disponibilidad
 * ❌ No aplica reglas de negocio complejas
 * ❌ No transforma DTO
 *
 * 👉 Este service NO debe romperse
 */
export async function obtenerEspaciosActivosService(
  params: ObtenerEspaciosActivosParams = {}
): Promise<Espacio[]> {
  const {
    where = {},
    orderBy = { nombre: "asc" },
  } = params;

  return EspaciosRepository.findMany(
    {
      ...BASE_WHERE,
      ...where, // filtros adicionales seguros
    },
    orderBy
  );
}
