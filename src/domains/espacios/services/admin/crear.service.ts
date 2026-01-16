// src/services/espacios/admin/crear.service.ts

import { EspaciosRepository } from "@/domains/espacios/repositories/espacios.repository";
import { normalizeCrearData, toEspacioDTO } from "@/domains/espacios/mappers/espacioDTO";
import { TipoEspacio, ModalidadCobro } from "@prisma/client";

/**
 * Crear espacio (ADMIN)
 * - Prepara el espacio para catálogo público
 * - Aplica defaults de dominio
 */
export async function crearService(data: any) {
  let payload = normalizeCrearData(data);

  // 🔹 Defaults por tipo (dominio ENAP)
  if (!payload.modalidadCobro) {
    if (payload.tipo === TipoEspacio.CABANA) {
      payload.modalidadCobro = ModalidadCobro.POR_NOCHE;
    }

    if (payload.tipo === TipoEspacio.QUINCHO) {
      payload.modalidadCobro = ModalidadCobro.POR_DIA;
    }

    if (payload.tipo === TipoEspacio.PISCINA) {
      payload.modalidadCobro = ModalidadCobro.POR_PERSONA;
    }
  }

  // 🔹 Asegurar publicabilidad
  payload.activo = payload.activo ?? true;
  payload.visible = true;

  // 🔹 Normalizar strings visuales
  payload.descripcion = payload.descripcion?.trim() || null;
  payload.imagenUrl = payload.imagenUrl?.trim() || null;

  const espacio = await EspaciosRepository.create(payload);

  return toEspacioDTO(espacio);
}
