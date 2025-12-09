// src/controllers/espacios/helpers.ts

import { Response } from "express";
import { prisma } from "../../config/db";
import { ReservaEstado, ModalidadCobro, TipoEspacio } from "@prisma/client";

/* ============================================================
 * Mapper — Prisma → DTO (Frontend)
 * ============================================================ */
export const toEspacioDTO = (e: any) => ({
  id: e.id,
  nombre: e.nombre,
  tipo: e.tipo,

  capacidad: e.capacidad,
  capacidadExtra: e.capacidadExtra,

  tarifaClp: e.tarifaClp,
  tarifaExterno: e.tarifaExterno,

  extraSocioPorPersona: e.extraSocioPorPersona,
  extraTerceroPorPersona: e.extraTerceroPorPersona,

  descripcion: e.descripcion,
  imagenUrl: e.imagenUrl,

  modalidadCobro: e.modalidadCobro,
  activo: e.activo,

  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

/* ============================================================
 * Helper: Obtener espacio o retornar 404 (reduce duplicación)
 * ============================================================ */
export async function getEspacioOr404(id: string, res: Response) {
  const espacio = await prisma.espacio.findUnique({ where: { id } });

  if (!espacio) {
    res.status(404).json({ ok: false, error: "Espacio no encontrado" });
    return null;
  }

  return espacio;
}

/* ============================================================
 * Normalización para crear espacio
 * ============================================================ */
export function normalizeCrearData(data: any) {
  return {
    nombre: data.nombre,
    tipo: data.tipo as TipoEspacio,
    capacidad: data.capacidad,
    capacidadExtra: data.capacidadExtra ?? null,

    tarifaClp: data.tarifaClp,
    tarifaExterno: data.tarifaExterno ?? null,

    extraSocioPorPersona: data.extraSocioPorPersona ?? null,
    extraTerceroPorPersona: data.extraTerceroPorPersona ?? null,

    descripcion: data.descripcion?.trim() || null,
    imagenUrl: data.imagenUrl?.trim() || null,

    modalidadCobro: data.modalidadCobro ?? ModalidadCobro.POR_NOCHE,
    activo: data.activo ?? true,
  };
}

/* ============================================================
 * Normalización para actualizar espacio (preserva valores existentes)
 * ============================================================ */
export function normalizeActualizarData(data: any, exists: any) {
  return {
    nombre: data.nombre ?? exists.nombre,
    tipo: data.tipo ?? exists.tipo,

    capacidad: data.capacidad ?? exists.capacidad,
    capacidadExtra:
      data.capacidadExtra !== undefined
        ? data.capacidadExtra
        : exists.capacidadExtra,

    tarifaClp: data.tarifaClp ?? exists.tarifaClp,
    tarifaExterno:
      data.tarifaExterno !== undefined
        ? data.tarifaExterno
        : exists.tarifaExterno,

    extraSocioPorPersona:
      data.extraSocioPorPersona !== undefined
        ? data.extraSocioPorPersona
        : exists.extraSocioPorPersona,

    extraTerceroPorPersona:
      data.extraTerceroPorPersona !== undefined
        ? data.extraTerceroPorPersona
        : exists.extraTerceroPorPersona,

    descripcion:
      data.descripcion?.trim() === ""
        ? null
        : data.descripcion ?? exists.descripcion,

    imagenUrl:
      data.imagenUrl?.trim() === ""
        ? null
        : data.imagenUrl ?? exists.imagenUrl,

    modalidadCobro: data.modalidadCobro ?? exists.modalidadCobro,
    activo:
      typeof data.activo === "boolean" ? data.activo : exists.activo,
  };
}
