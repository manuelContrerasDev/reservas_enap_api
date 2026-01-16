import { obtenerEspaciosActivosService } from "@/domains/espacios/services/base/obtener-espacios-activos.service";
import { agruparEspaciosPorTipo } from "./producto-espacio.mapper";

export async function catalogoProductosService() {
  const espacios = await obtenerEspaciosActivosService();
  return agruparEspaciosPorTipo(espacios);
}
