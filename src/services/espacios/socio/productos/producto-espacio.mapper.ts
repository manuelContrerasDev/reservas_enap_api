// src/services/espacios/socio/productos/producto-espacio.mapper.ts
import { Espacio, TipoEspacio } from "@prisma/client";
import { ProductoEspacioDTO } from "../dtos/producto-espacio.dto";

const isString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

function nombrePorTipo(tipo: TipoEspacio): string {
  switch (tipo) {
    case "CABANA":
      return "Cabañas";
    case "QUINCHO":
      return "Quinchos";
    case "PISCINA":
      return "Piscina";
    default:
      return "Espacios";
  }
}

function descripcionPorTipo(tipo: TipoEspacio): string {
  switch (tipo) {
    case "CABANA":
      return "Arriendo de cabañas equipadas para descanso y estadía.";
    case "QUINCHO":
      return "Quinchos para reuniones, asados y eventos familiares.";
    case "PISCINA":
      return "Acceso a piscina por persona, según disponibilidad.";
    default:
      return "Catálogo de espacios disponibles.";
  }
}

export function agruparEspaciosPorTipo(espacios: Espacio[]): ProductoEspacioDTO[] {
  const map = new Map<TipoEspacio, Espacio[]>();

  for (const e of espacios) {
    if (!map.has(e.tipo)) map.set(e.tipo, []);
    map.get(e.tipo)!.push(e);
  }

  return Array.from(map.entries()).map(([tipo, items]) => {
    const base = items[0];

    return {
      tipo: base.tipo,

      nombre: nombrePorTipo(base.tipo),
      descripcion: descripcionPorTipo(base.tipo),

      capacidad: base.capacidad,
      modalidadCobro: base.modalidadCobro,

      precioBaseSocio: base.precioBaseSocio,
      precioBaseExterno: base.precioBaseExterno,

      totalUnidades: items.length,

      imagenes: items.map((i) => i.imagenUrl).filter(isString),

      reservable: true,
    };
  });
}
