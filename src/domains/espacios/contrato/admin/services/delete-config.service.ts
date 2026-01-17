// src/domains/espacios/contrato/admin/services/delete-config.service.ts
import { EspacioTipoConfigRepository } from "../../repositories/espacio-tipo-config.repository";

export async function deleteEspacioTipoConfigService(tipo: string) {
  return EspacioTipoConfigRepository.softDelete(tipo as any);
}
