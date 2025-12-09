// src/services/espacios/admin/admin-list.service.ts

import { EspaciosRepository } from "../../../repositories/espacios.repository";
import { toEspacioDTO } from "../helpers";

export async function adminListService() {
  const espacios = await EspaciosRepository.findMany({}, { nombre: "asc" });
  return espacios.map(toEspacioDTO);
}
