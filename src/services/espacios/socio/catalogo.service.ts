// src/services/espacios/socio/catalogo.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { toEspacioDTO } from "../helpers";
import { TipoEspacio, Prisma } from "@prisma/client";

export async function catalogoService(query: any) {
  const q = query || {};

  const search = (q.search ?? "").trim();

  const tipo =
    q.tipo && Object.values(TipoEspacio).includes(q.tipo as TipoEspacio)
      ? (q.tipo as TipoEspacio)
      : undefined;

  const capacidadMin = q.capacidadMin ? Number(q.capacidadMin) : undefined;
  const capacidadMax = q.capacidadMax ? Number(q.capacidadMax) : undefined;

  const orderBy = { nombre: q.order === "desc" ? "desc" : "asc" };

  const where: Prisma.EspacioWhereInput = {
    activo: true,
    ...(search ? { nombre: { contains: search, mode: "insensitive" } } : {}),
    ...(tipo ? { tipo } : {}),
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
