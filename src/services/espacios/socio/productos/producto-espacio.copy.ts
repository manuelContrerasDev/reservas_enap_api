import { TipoEspacio } from "@prisma/client";

export function nombrePorTipo(tipo: TipoEspacio): string {
  switch (tipo) {
    case TipoEspacio.CABANA:
      return "Cabañas";
    case TipoEspacio.QUINCHO:
      return "Quinchos";
    case TipoEspacio.PISCINA:
      return "Piscina";
    default:
      return "Espacios";
  }
}

export function descripcionPorTipo(tipo: TipoEspacio): string {
  switch (tipo) {
    case TipoEspacio.CABANA:
      return "Cabañas equipadas para descanso y estadías familiares.";
    case TipoEspacio.QUINCHO:
      return "Quinchos ideales para reuniones, asados y eventos.";
    case TipoEspacio.PISCINA:
      return "Piscina recreativa con acceso por persona.";
    default:
      return "Espacios disponibles para reserva.";
  }
}
