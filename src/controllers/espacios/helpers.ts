// src/controllers/espacios/helpers.ts
import { prisma } from "../../lib/db";
import { ModalidadCobro, TipoEspacio } from "@prisma/client";

/* ============================================================
 * Tipos locales (evita any y errores de propiedades)
 * ============================================================ */
type EspacioModel = {
  id: string;
  nombre: string;
  tipo: TipoEspacio;
  descripcion: string | null;
  imagenUrl: string | null;

  capacidad: number;

  activo: boolean;
  visible: boolean;
  orden: number;

  modalidadCobro: ModalidadCobro;

  precioBaseSocio: number;
  precioBaseExterno: number;

  precioPersonaAdicionalSocio: number;
  precioPersonaAdicionalExterno: number;

  precioPiscinaSocio: number;
  precioPiscinaExterno: number;

  createdAt: Date;
  updatedAt: Date;
};

/* ============================================================
 * Mapper — Prisma → DTO (Frontend)
 * ============================================================ */
export const toEspacioDTO = (e: EspacioModel) => ({
  id: e.id,
  nombre: e.nombre,
  tipo: e.tipo,

  capacidad: e.capacidad,

  descripcion: e.descripcion,
  imagenUrl: e.imagenUrl,

  activo: e.activo,
  visible: e.visible,
  orden: e.orden,

  modalidadCobro: e.modalidadCobro,

  precioBaseSocio: e.precioBaseSocio,
  precioBaseExterno: e.precioBaseExterno,

  precioPersonaAdicionalSocio: e.precioPersonaAdicionalSocio,
  precioPersonaAdicionalExterno: e.precioPersonaAdicionalExterno,

  precioPiscinaSocio: e.precioPiscinaSocio,
  precioPiscinaExterno: e.precioPiscinaExterno,

  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

/* ============================================================
 * Helper: Obtener espacio o lanzar NOT_FOUND
 * ============================================================ */
export async function getEspacioOr404(id: string) {
  const espacio = await prisma.espacio.findUnique({ where: { id } });
  if (!espacio) throw new Error("ESPACIO_NOT_FOUND");
  return espacio as unknown as EspacioModel;
}

/* ============================================================
 * Normalización para crear espacio
 * (NO inventa reglas de negocio, solo normaliza nulls/defaults)
 * ============================================================ */
export function normalizeCrearData(data: any) {
  return {
    nombre: String(data.nombre ?? "").trim(),
    tipo: data.tipo as TipoEspacio,

    capacidad: Number(data.capacidad),

    descripcion: data.descripcion?.trim() ? String(data.descripcion).trim() : null,
    imagenUrl: data.imagenUrl?.trim() ? String(data.imagenUrl).trim() : null,

    activo: typeof data.activo === "boolean" ? data.activo : true,
    visible: typeof data.visible === "boolean" ? data.visible : true,
    orden: typeof data.orden === "number" ? data.orden : 0,

    modalidadCobro: (data.modalidadCobro ?? ModalidadCobro.POR_DIA) as ModalidadCobro,

    precioBaseSocio: Number(data.precioBaseSocio ?? 0),
    precioBaseExterno: Number(data.precioBaseExterno ?? 0),

    precioPersonaAdicionalSocio: Number(data.precioPersonaAdicionalSocio ?? 3500),
    precioPersonaAdicionalExterno: Number(data.precioPersonaAdicionalExterno ?? 4500),

    precioPiscinaSocio: Number(data.precioPiscinaSocio ?? 3500),
    precioPiscinaExterno: Number(data.precioPiscinaExterno ?? 4500),
  };
}

/* ============================================================
 * Normalización para actualizar espacio
 * (Preserva lo existente, aplica cambios explícitos)
 * ============================================================ */
export function normalizeActualizarData(data: any, exists: EspacioModel) {
  const pickBool = (v: any, fallback: boolean) =>
    typeof v === "boolean" ? v : fallback;

  const pickNum = (v: any, fallback: number) =>
    v === undefined || v === null || Number.isNaN(Number(v)) ? fallback : Number(v);

  const pickStrOrNull = (v: any, fallback: string | null) => {
    if (v === undefined) return fallback;
    const s = String(v).trim();
    return s === "" ? null : s;
  };

  return {
    nombre: data.nombre !== undefined ? String(data.nombre).trim() : exists.nombre,
    tipo: data.tipo ?? exists.tipo,

    capacidad: pickNum(data.capacidad, exists.capacidad),

    descripcion: pickStrOrNull(data.descripcion, exists.descripcion),
    imagenUrl: pickStrOrNull(data.imagenUrl, exists.imagenUrl),

    activo: pickBool(data.activo, exists.activo),
    visible: pickBool(data.visible, exists.visible),
    orden: pickNum(data.orden, exists.orden),

    modalidadCobro: (data.modalidadCobro ?? exists.modalidadCobro) as ModalidadCobro,

    precioBaseSocio: pickNum(data.precioBaseSocio, exists.precioBaseSocio),
    precioBaseExterno: pickNum(data.precioBaseExterno, exists.precioBaseExterno),

    precioPersonaAdicionalSocio: pickNum(
      data.precioPersonaAdicionalSocio,
      exists.precioPersonaAdicionalSocio
    ),
    precioPersonaAdicionalExterno: pickNum(
      data.precioPersonaAdicionalExterno,
      exists.precioPersonaAdicionalExterno
    ),

    precioPiscinaSocio: pickNum(data.precioPiscinaSocio, exists.precioPiscinaSocio),
    precioPiscinaExterno: pickNum(data.precioPiscinaExterno, exists.precioPiscinaExterno),
  };
}
