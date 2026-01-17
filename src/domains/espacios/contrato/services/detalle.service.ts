// src/domains/espacios/contrato/services/detalle.service.ts
import { TipoEspacio } from "@prisma/client";
import { EspacioTipoConfigRepository } from "../repositories/espacio-tipo-config.repository";
import { DisponibilidadTipoRepository } from "../repositories/disponibilidad-tipo.repository";
import { PiscinaCuposRepository } from "../repositories/piscina-cupos.repository";
import { LunesExcepcionesRepository } from "../repositories/lunes-excepciones.repository";
import { eachDay, isMonday, toISODate } from "./detalle.helpers";

export async function detalleContratoService(params: {
  tipo: TipoEspacio;
  desdeISO: string;
  hastaISO: string;
}) {
  const desde = new Date(params.desdeISO);
  const hasta = new Date(params.hastaISO);

  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) throw new Error("FECHAS_INVALIDAS");
  if (desde > hasta) throw new Error("RANGO_INVALIDO");

  const config = await EspacioTipoConfigRepository.findByTipoOrThrow(params.tipo);
  const lunesEnabled = await LunesExcepcionesRepository.getEnabledDatesISO();

  const dias = eachDay(desde, hasta);

  const disponibilidad = [];
  for (const d of dias) {
    const diaInicio = new Date(d); diaInicio.setHours(0, 0, 0, 0);
    const diaFin = new Date(d); diaFin.setHours(23, 59, 59, 999);

    const fecha = toISODate(d);
    const monday = isMonday(d);
    const mondayException = monday && lunesEnabled.has(fecha);

    let unidadesDisponibles: number | undefined;
    let cuposDisponibles: number | undefined;

    if (params.tipo === "CABANA" || params.tipo === "QUINCHO") {
      const total = config.unidadesTotales ?? 0;
      const ocupadas = await DisponibilidadTipoRepository.contarReservasActivasPorTipoEnDia(params.tipo, diaInicio, diaFin);
      unidadesDisponibles = Math.max(0, total - ocupadas);
    }

    if (params.tipo === "PISCINA") {
      const total = config.cupoTotal ?? 0;
      const ocupadas = await PiscinaCuposRepository.contarPersonasPiscinaEnDia(diaInicio, diaFin);
      cuposDisponibles = Math.max(0, total - ocupadas);
    }

    // reservable depende SOLO de stock/cupo + bloqueos duros (si los hubiera)
    // lunes es flag UX: no lo bloqueamos acá (la regla dura vive en Reservas).
    const tieneStock =
      (unidadesDisponibles !== undefined ? unidadesDisponibles > 0 : true) &&
      (cuposDisponibles !== undefined ? cuposDisponibles > 0 : true);

    disponibilidad.push({
      fecha,
      reservable: tieneStock,
      unidadesDisponibles,
      cuposDisponibles,
      bloqueadoPorLunes: monday && !mondayException,
      bloqueadoPorExcepcion: false,
    });
  }

  return { config, disponibilidad };
}
