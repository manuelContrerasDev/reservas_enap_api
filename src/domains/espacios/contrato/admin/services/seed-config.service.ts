// src/domains/espacios/contrato/admin/services/seed-config.service.ts
import { prisma } from "@/lib/db";
import { patchEspacioTipoConfigSchema } from "../validators/patch-config.schema";

export async function seedEspacioTipoConfigService(input: unknown) {
  const data = patchEspacioTipoConfigSchema.parse(input);

  if (!data.titulo || !data.descripcion) {
    throw new Error("TITULO_Y_DESCRIPCION_REQUERIDOS");
  }

  return prisma.espacioTipoConfig.upsert({
    where: { tipo: data.tipo },

    create: {
      tipo: data.tipo,
      titulo: data.titulo,
      descripcion: data.descripcion,
      imagenes: data.imagenes ?? [],
      visible: data.visible ?? true,

      unidadesTotales: data.unidadesTotales ?? null,
      cupoTotal: data.cupoTotal ?? null,

      modalidadCobro: data.modalidadCobro ?? "POR_NOCHE",

      capacidadSocio: data.capacidadSocio ?? null,
      capacidadExterno: data.capacidadExterno ?? null,
      capacidadComun: data.capacidadComun ?? null,
      capacidadAlojamiento: data.capacidadAlojamiento ?? null,
      maximoAbsoluto: data.maximoAbsoluto ?? null,

      precioBaseSocio: data.precioBaseSocio ?? 0,
      precioBaseExterno: data.precioBaseExterno ?? 0,

      precioExtraSocio: data.precioExtraSocio ?? 0,
      precioExtraExterno: data.precioExtraExterno ?? 0,

      precioPiscinaSocio: data.precioPiscinaSocio ?? null,
      precioPiscinaExterno: data.precioPiscinaExterno ?? null,
      freePiscinaSocio: data.freePiscinaSocio ?? null,
    },

    update: {
      ...data,
      imagenes: data.imagenes ?? undefined,
      deletedAt: null,
    },
  });
}
