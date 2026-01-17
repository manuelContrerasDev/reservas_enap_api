import { EspacioTipoConfig } from "@prisma/client";

interface DetalleMapperInput {
  config: EspacioTipoConfig;
  disponibilidad: unknown[];
}

export function mapDetalleResponse({
  config,
  disponibilidad,
}: DetalleMapperInput) {
  return {
    tipo: config.tipo,
    titulo: config.titulo,
    descripcion: config.descripcion,
    imagenes: config.imagenes,
    modalidadCobro: config.modalidadCobro,

    capacidades: {
      socio: config.capacidadSocio,
      externo: config.capacidadExterno,
      comun: config.capacidadComun,
      alojamiento: config.capacidadAlojamiento,
      maximoAbsoluto: config.maximoAbsoluto,
    },

    disponibilidad,
  };
}
