import { PrismaClient, TipoEspacio, ModalidadCobro } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedEspaciosTipoConfig() {
  const data = [
    {
      tipo: TipoEspacio.CABANA,
      titulo: "Cabañas",
      descripcion: "Cabañas equipadas para estadía familiar",
      imagenes: [],
      modalidadCobro: ModalidadCobro.POR_NOCHE,
      unidadesTotales: 10,

      capacidadComun: 6,
      capacidadAlojamiento: 6,
      maximoAbsoluto: 10,

      precioBaseSocio: 25000,
      precioBaseExterno: 60000,

      precioExtraSocio: 3500,
      precioExtraExterno: 4500,

      precioPiscinaSocio: 3500,
      precioPiscinaExterno: 4000,
      freePiscinaSocio: 5,
    },
    {
      tipo: TipoEspacio.QUINCHO,
      titulo: "Quinchos",
      descripcion: "Quinchos para eventos y reuniones",
      imagenes: [],
      modalidadCobro: ModalidadCobro.POR_DIA,
      unidadesTotales: 10,

      capacidadSocio: 15,
      capacidadExterno: 10,

      precioBaseSocio: 10000,
      precioBaseExterno: 30000,

      precioExtraSocio: 3500,
      precioExtraExterno: 4500,
    },
    {
      tipo: TipoEspacio.PISCINA,
      titulo: "Piscina",
      descripcion: "Acceso diario a piscina",
      imagenes: [],
      modalidadCobro: ModalidadCobro.POR_PERSONA,
      cupoTotal: 100,

      precioPiscinaSocio: 3500,
      precioPiscinaExterno: 4000,
      freePiscinaSocio: 5,

      precioBaseSocio: 0,
      precioBaseExterno: 0,

      precioExtraSocio: 0,
      precioExtraExterno: 0,
    },
  ];

  for (const item of data) {
    await prisma.espacioTipoConfig.upsert({
      where: { tipo: item.tipo },
      update: {},
      create: item,
    });
  }
}
