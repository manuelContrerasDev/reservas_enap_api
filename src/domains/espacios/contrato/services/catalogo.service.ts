// src/domains/espacios/contrato/services/catalogo.service.ts
import { EspacioTipoConfigRepository } from "../repositories/espacio-tipo-config.repository";
import { resolvePricingTier } from "./pricing-tier";
import { mapConfigToCatalogoCard } from "../mappers/catalogo.mapper";
import { Role, UsoReserva } from "@prisma/client";

export async function catalogoContratoService(params: {
  actorRole?: Role | null;
  usoReserva?: UsoReserva | null;
}) {
  const tier = resolvePricingTier(params);
  const configs = await EspacioTipoConfigRepository.findPublicAll();
  return configs.map((cfg) => mapConfigToCatalogoCard(cfg, tier));
}
