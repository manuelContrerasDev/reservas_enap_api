// src/services/espacios/admin/actualizar.service.ts

import { EspaciosRepository } from "@/domains/espacios/repositories/espacios.repository";
import { normalizeActualizarData, toEspacioDTO } from "@/domains/espacios/mappers/espacioDTO";
import { ModalidadCobro, TipoEspacio } from "@prisma/client";

/**
 * Actualizar espacio (ADMIN)
 * - Preserva integridad del dominio
 * - Evita romper reservas futuras
 * - Mantiene consistencia de catálogo
 */
export async function actualizarService(id: string, data: any) {
  const exists = await EspaciosRepository.findById(id);
  if (!exists) {
    throw new Error("ESPACIO_NOT_FOUND");
  }

  const payload = normalizeActualizarData(data, exists);

  /* ============================================================
   * 🔒 Reglas de dominio mínimas
   * ============================================================ */

  // 1️⃣ Proteger modalidad por tipo (evita romper cálculos)
  if (data.modalidadCobro) {
    if (
      exists.tipo === TipoEspacio.CABANA &&
      data.modalidadCobro !== ModalidadCobro.POR_NOCHE
    ) {
      payload.modalidadCobro = ModalidadCobro.POR_NOCHE;
    }

    if (
      exists.tipo === TipoEspacio.QUINCHO &&
      data.modalidadCobro !== ModalidadCobro.POR_DIA
    ) {
      payload.modalidadCobro = ModalidadCobro.POR_DIA;
    }

    if (
      exists.tipo === TipoEspacio.PISCINA &&
      data.modalidadCobro !== ModalidadCobro.POR_PERSONA
    ) {
      payload.modalidadCobro = ModalidadCobro.POR_PERSONA;
    }
  }

  // 2️⃣ Nunca perder visibilidad por accidente
  payload.visible = exists.visible;

  // 3️⃣ Normalizar strings visuales
  //payload.descripcion = payload.descripcion?.trim() || null;
  //payload.imagenUrl = payload.imagenUrl?.trim() || null;

  const espacio = await EspaciosRepository.update(id, payload);

  return toEspacioDTO(espacio);
}
