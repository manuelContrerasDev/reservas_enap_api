// src/domains/espacios/contrato/repositories/espacio-tipo-config.repository.ts
import { prisma } from "@/lib/db";
import { TipoEspacio } from "@prisma/client";

export const EspacioTipoConfigRepository = {
  findPublicAll() {
    return prisma.espacioTipoConfig.findMany({
      where: { visible: true, deletedAt: null },
      orderBy: { tipo: "asc" },
    });
  },

  findByTipo(tipo: TipoEspacio) {
    return prisma.espacioTipoConfig.findUnique({ where: { tipo } });
  },

  async findByTipoOrThrow(tipo: TipoEspacio) {
    const config = await prisma.espacioTipoConfig.findUnique({ where: { tipo } });
    if (!config || config.deletedAt) throw new Error("CONFIG_NOT_FOUND");
    return config;
  },

  patchByTipo(tipo: TipoEspacio, data: any) {
    return prisma.espacioTipoConfig.update({
      where: { tipo },
      data,
    });
  },

  softDelete(tipo: TipoEspacio) {
    return prisma.espacioTipoConfig.update({
      where: { tipo },
      data: { deletedAt: new Date(), visible: false },
    });
  },
};
