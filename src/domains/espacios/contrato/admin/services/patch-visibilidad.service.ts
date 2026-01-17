// src/domains/espacios/contrato/admin/services/patch-visibilidad.service.ts
import { EspacioTipoConfigRepository } from "../../repositories/espacio-tipo-config.repository";

export async function patchVisibilidadService(tipo: string, visible: boolean) {
  return EspacioTipoConfigRepository.patchByTipo(tipo as any, { visible });
}
