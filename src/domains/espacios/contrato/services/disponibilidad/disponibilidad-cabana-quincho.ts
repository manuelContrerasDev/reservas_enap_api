import { TipoEspacio } from "@prisma/client";
import { DisponibilidadTipoRepository } from "../../repositories/disponibilidad-tipo.repository";
import { toISODate } from "../detalle.helpers";

export async function disponibilidadCabanaQuincho(
  tipo: TipoEspacio,
  unidadesTotales: number,
  dia: Date
) {
  const inicio = new Date(dia);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(dia);
  fin.setHours(23, 59, 59, 999);

  const ocupadas =
    await DisponibilidadTipoRepository.contarReservasActivasPorTipoEnDia(
      tipo,
      inicio,
      fin
    );

  const disponibles = Math.max(0, unidadesTotales - ocupadas);

  return {
    fecha: toISODate(dia),
    unidadesDisponibles: disponibles,
    reservable: disponibles > 0,
  };
}
