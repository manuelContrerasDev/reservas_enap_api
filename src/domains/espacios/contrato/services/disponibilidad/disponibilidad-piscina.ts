import { PiscinaCuposRepository } from "../../repositories/piscina-cupos.repository";
import { toISODate } from "../detalle.helpers";

export async function disponibilidadPiscina(
  cupoTotal: number,
  dia: Date
) {
  const inicio = new Date(dia);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(dia);
  fin.setHours(23, 59, 59, 999);

  const ocupados =
    await PiscinaCuposRepository.contarPersonasPiscinaEnDia(inicio, fin);

  const disponibles = Math.max(0, cupoTotal - ocupados);

  return {
    fecha: toISODate(dia),
    cuposDisponibles: disponibles,
    reservable: disponibles > 0,
  };
}
