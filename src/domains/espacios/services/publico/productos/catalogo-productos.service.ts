import { obtenerEspaciosActivosService } from "../../base/obtener-espacios-activos.service";
import { agruparEspaciosPorTipo } from "../../../../../services/espacios/socio/productos/producto-espacio.mapper";

export async function catalogoProductosService() {
  const espacios = await obtenerEspaciosActivosService();
  return agruparEspaciosPorTipo(espacios);
}
