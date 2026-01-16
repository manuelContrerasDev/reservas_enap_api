import { Prisma, TipoEspacio } from "@prisma/client";
import { toEspacioDTO } from "../../mappers/espacioDTO";
import {
  obtenerEspaciosActivosService,
} from "@/domains/espacios/services/base/obtener-espacios-activos.service";

interface CatalogoQuery {
  search?: string;
  tipo?: TipoEspacio;
  capacidadMin?: string | number;
  capacidadMax?: string | number;
  order?: "asc" | "desc";
}

export async function catalogoService(query: CatalogoQuery = {}) {
  const search =
    typeof query.search === "string" ? query.search.trim() : undefined;

  const tipo =
    query.tipo && Object.values(TipoEspacio).includes(query.tipo)
      ? query.tipo
      : undefined;

  const capacidadMin =
    query.capacidadMin !== undefined
      ? Number(query.capacidadMin)
      : undefined;

  const capacidadMax =
    query.capacidadMax !== undefined
      ? Number(query.capacidadMax)
      : undefined;

  const where: Prisma.EspacioWhereInput = {
    ...(tipo ? { tipo } : {}),

    ...(search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { descripcion: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),

    ...(capacidadMin !== undefined || capacidadMax !== undefined
      ? {
          capacidad: {
            ...(capacidadMin !== undefined ? { gte: capacidadMin } : {}),
            ...(capacidadMax !== undefined ? { lte: capacidadMax } : {}),
          },
        }
      : {}),
  };

  const espacios = await obtenerEspaciosActivosService({
    where,
    orderBy: {
      nombre: query.order === "desc" ? "desc" : "asc",
    },
  });

  return espacios.map(toEspacioDTO);
}
