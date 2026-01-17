// src/domains/espacios/contrato/admin/services/patch-config.service.ts
import { EspacioTipoConfigRepository } from "../../repositories/espacio-tipo-config.repository";
import { patchEspacioTipoConfigSchema } from "../validators/patch-config.schema";

export async function patchEspacioTipoConfigService(
  tipo: string,
  input: unknown
) {
  const parsed = patchEspacioTipoConfigSchema.parse({
    ...(input as Record<string, unknown>),
    tipo,
  });

  return EspacioTipoConfigRepository.patchByTipo(parsed.tipo, parsed);
}
