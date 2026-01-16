import { obtenerEspaciosActivosService } from "../../base/obtener-espacios-activos.service";
import { agruparEspaciosPorTipo } from "./index";

export async function catalogoProductosService() {
  const espacios = await obtenerEspaciosActivosService();
  return agruparEspaciosPorTipo(espacios);
}
