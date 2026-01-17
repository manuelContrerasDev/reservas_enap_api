import { TipoEspacio } from "@prisma/client";
import { EspacioTipoConfigRepository } from "../repositories/espacio-tipo-config.repository";
import { eachDay } from "./detalle.helpers";
import { disponibilidadCabanaQuincho } from "./disponibilidad/disponibilidad-cabana-quincho";
import { disponibilidadPiscina } from "./disponibilidad/disponibilidad-piscina";
import { mapDetalleResponse } from "../mappers/detalle.mapper";

interface DetalleContratoInput {
  tipo: TipoEspacio;
  desdeISO: string;
  hastaISO: string;
}

export async function detalleContratoService({
  tipo,
  desdeISO,
  hastaISO,
}: DetalleContratoInput) {
  // ✅ nombre correcto
  const config = await EspacioTipoConfigRepository.findByTipoOrThrow(tipo);

  const desde = new Date(desdeISO);
  const hasta = new Date(hastaISO);

  const dias = eachDay(desde, hasta);
  const disponibilidad: any[] = [];

  for (const dia of dias) {
    if (tipo === TipoEspacio.CABANA || tipo === TipoEspacio.QUINCHO) {
      disponibilidad.push(
        await disponibilidadCabanaQuincho(
          tipo,
          config.unidadesTotales!,
          dia
        )
      );
    }

    if (tipo === TipoEspacio.PISCINA) {
      disponibilidad.push(
        await disponibilidadPiscina(
          config.cupoTotal!,
          dia
        )
      );
    }
  }

  return mapDetalleResponse({
    config,
    disponibilidad,
  });
}
