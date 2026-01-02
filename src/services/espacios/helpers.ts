import { ModalidadCobro, TipoEspacio, Espacio, Prisma } from "@prisma/client";

/* ============================================================
 * Mapper — Prisma → DTO (MODEL FINAL)
 * ============================================================ */
export const toEspacioDTO = (e: Espacio) => ({
  id: e.id,
  nombre: e.nombre,
  tipo: e.tipo,

  descripcion: e.descripcion,
  imagenUrl: e.imagenUrl,

  capacidad: e.capacidad,

  // estado / visibilidad / orden
  activo: e.activo,
  visible: e.visible,
  orden: e.orden,

  modalidadCobro: e.modalidadCobro,

  // tarifas base
  precioBaseSocio: e.precioBaseSocio,
  precioBaseExterno: e.precioBaseExterno,

  // extras
  precioPersonaAdicionalSocio: e.precioPersonaAdicionalSocio,
  precioPersonaAdicionalExterno: e.precioPersonaAdicionalExterno,

  precioPiscinaSocio: e.precioPiscinaSocio,
  precioPiscinaExterno: e.precioPiscinaExterno,

  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

/* ============================================================
 * Normalización para CREAR
 * Backend es fuente de verdad del dominio
 * ============================================================ */
export function normalizeCrearData(
  data: any
): Prisma.EspacioCreateInput {
  const tipo = data.tipo as TipoEspacio;

  // 🔒 modalidad según tipo (regla fija)
  let modalidad: ModalidadCobro;
  switch (tipo) {
    case TipoEspacio.CABANA:
      modalidad = ModalidadCobro.POR_NOCHE;
      break;
    case TipoEspacio.QUINCHO:
      modalidad = ModalidadCobro.POR_DIA;
      break;
    case TipoEspacio.PISCINA:
      modalidad = ModalidadCobro.POR_PERSONA;
      break;
    default:
      modalidad = ModalidadCobro.POR_DIA;
  }

  return {
    nombre: String(data.nombre).trim(),
    tipo,

    descripcion:
      typeof data.descripcion === "string"
        ? data.descripcion.trim() || null
        : null,

    imagenUrl:
      typeof data.imagenUrl === "string"
        ? data.imagenUrl.trim() || null
        : null,

    capacidad: Number(data.capacidad),

    activo: typeof data.activo === "boolean" ? data.activo : true,
    visible: true,
    orden: Number.isFinite(Number(data.orden)) ? Number(data.orden) : 0,

    modalidadCobro: modalidad,

    // tarifas
    precioBaseSocio: Number(data.precioBaseSocio ?? 0),
    precioBaseExterno: Number(data.precioBaseExterno ?? 0),

    precioPersonaAdicionalSocio: Number(
      data.precioPersonaAdicionalSocio ?? 3500
    ),
    precioPersonaAdicionalExterno: Number(
      data.precioPersonaAdicionalExterno ?? 4500
    ),

    precioPiscinaSocio: Number(data.precioPiscinaSocio ?? 3500),
    precioPiscinaExterno: Number(data.precioPiscinaExterno ?? 4500),
  };
}

/* ============================================================
 * Normalización para ACTUALIZAR
 * - No permite cambiar `visible`
 * - Preserva modalidad coherente con el tipo
 * ============================================================ */
export function normalizeActualizarData(
  data: any,
  exists: Espacio
): Prisma.EspacioUpdateInput {
  const up: Prisma.EspacioUpdateInput = {};

  if (data.nombre !== undefined) {
    up.nombre = String(data.nombre).trim();
  }

  if (data.descripcion !== undefined) {
    const v = String(data.descripcion ?? "").trim();
    up.descripcion = v === "" ? null : v;
  }

  if (data.imagenUrl !== undefined) {
    const v = String(data.imagenUrl ?? "").trim();
    up.imagenUrl = v === "" ? null : v;
  }

  if (data.capacidad !== undefined) {
    up.capacidad = Number(data.capacidad);
  }

  if (typeof data.activo === "boolean") {
    up.activo = data.activo;
  }

  if (data.orden !== undefined) {
    up.orden = Number(data.orden);
  }

  // 🔒 modalidad NO se cambia libremente (se protege en el service)
  if (data.modalidadCobro !== undefined) {
    up.modalidadCobro = exists.modalidadCobro;
  }

  // tarifas
  if (data.precioBaseSocio !== undefined) {
    up.precioBaseSocio = Number(data.precioBaseSocio);
  }

  if (data.precioBaseExterno !== undefined) {
    up.precioBaseExterno = Number(data.precioBaseExterno);
  }

  if (data.precioPersonaAdicionalSocio !== undefined) {
    up.precioPersonaAdicionalSocio = Number(
      data.precioPersonaAdicionalSocio
    );
  }

  if (data.precioPersonaAdicionalExterno !== undefined) {
    up.precioPersonaAdicionalExterno = Number(
      data.precioPersonaAdicionalExterno
    );
  }

  if (data.precioPiscinaSocio !== undefined) {
    up.precioPiscinaSocio = Number(data.precioPiscinaSocio);
  }

  if (data.precioPiscinaExterno !== undefined) {
    up.precioPiscinaExterno = Number(data.precioPiscinaExterno);
  }

  return up;
}
