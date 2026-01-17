// src/domains/espacios/contrato/mappers/catalogo.mapper.ts
import { EspacioTipoConfig } from "@prisma/client";
import type { PricingTier } from "../services/pricing-tier";

export function mapConfigToCatalogoCard(cfg: EspacioTipoConfig, tier: PricingTier) {
  const precioBase = tier === "SOCIO" ? cfg.precioBaseSocio : cfg.precioBaseExterno;

  return {
    tipo: cfg.tipo,
    titulo: cfg.titulo,
    descripcion: cfg.descripcion,
    imagenes: (cfg.imagenes as any[]) ?? [],
    visible: cfg.visible,
    modalidadCobro: cfg.modalidadCobro,

    inventario: {
      unidadesTotales: cfg.unidadesTotales ?? undefined,
      cupoTotal: cfg.cupoTotal ?? undefined,
    },

    capacidades: {
      socio: cfg.capacidadSocio ?? undefined,
      externo: cfg.capacidadExterno ?? undefined,
      comun: cfg.capacidadComun ?? undefined,
      alojamiento: cfg.capacidadAlojamiento ?? undefined,
      maximoAbsoluto: cfg.maximoAbsoluto ?? undefined,
    },

    precioMostrado: precioBase,
    pricingTier: tier, // útil para debug/front; si no lo quieres, se puede quitar
  };
}
