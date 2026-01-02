// src/services/espacios/socio/catalogo.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { toEspacioDTO } from "../helpers";
import { Prisma, TipoEspacio } from "@prisma/client";

export async function catalogoService(query: any) {
  const q = query ?? {};

  const search = typeof q.search === "string" ? q.search.trim() : undefined;

  const tipo =
    q.tipo && Object.values(TipoEspacio).includes(q.tipo as TipoEspacio)
      ? (q.tipo as TipoEspacio)
      : undefined;

  const capacidadMin =
    q.capacidadMin !== undefined ? Number(q.capacidadMin) : undefined;

  const capacidadMax =
    q.capacidadMax !== undefined ? Number(q.capacidadMax) : undefined;

  const orderBy: Prisma.EspacioOrderByWithRelationInput = {
    nombre: q.order === "desc" ? "desc" : "asc",
  };

  const where: Prisma.EspacioWhereInput = {
    activo: true,
    visible: true,

    ...(tipo ? { tipo } : {}),

    ...(search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { descripcion: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),

    ...(capacidadMin || capacidadMax
      ? {
          capacidad: {
            ...(capacidadMin ? { gte: capacidadMin } : {}),
            ...(capacidadMax ? { lte: capacidadMax } : {}),
          },
        }
      : {}),
  };

  const espacios = await EspaciosRepository.findMany(where, orderBy);

  return espacios.map(toEspacioDTO);
}
