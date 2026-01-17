// src/domains/espacios/contrato/services/pricing-tier.ts
import { UsoReserva, Role } from "@prisma/client";

export type PricingTier = "SOCIO" | "EXTERNO";

export function resolvePricingTier(params: {
  actorRole?: Role | null;
  usoReserva?: UsoReserva | null;
}): PricingTier {
  const role = params.actorRole ?? Role.EXTERNO;

  if (role === Role.EXTERNO) return "EXTERNO";
  // role SOCIO
  const uso = params.usoReserva ?? UsoReserva.USO_PERSONAL;
  if (uso === UsoReserva.TERCEROS) return "EXTERNO";
  return "SOCIO";
}
