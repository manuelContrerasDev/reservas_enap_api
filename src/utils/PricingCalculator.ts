// src/utils/PricingCalculator.ts

import { Espacio, Role, UsoReserva } from "@prisma/client";

// Modelo oficial ENAP 2025
type PricingStrategy = "LINEAR" | "MULTIPLICATIVE";

// Configurable por env si quieres
const CURRENT_STRATEGY: PricingStrategy = "LINEAR";

interface PricingInput {
  espacio: Espacio;
  role: Role;
  usoReserva: UsoReserva;
  dias: number;
  cantidadAdultos: number;    
  cantidadPiscina: number;
}

export const PricingCalculator = {
  calculate({ espacio, role, usoReserva, dias, cantidadAdultos, cantidadPiscina }: PricingInput) {
    
    const esExterno =
      role === "EXTERNO" || usoReserva === "TERCEROS";

    // 1. Tarifas según socio/externo
    const precioBase    = esExterno ? espacio.precioBaseExterno    : espacio.precioBaseSocio;
    const precioPersona = esExterno ? espacio.precioPersonaExterno : espacio.precioPersonaSocio;
    const precioPiscina = esExterno ? espacio.precioPiscinaExterno : espacio.precioPiscinaSocio;

    // 2. BASE — Todas las modalidades (POR_DIA, POR_NOCHE, etc.) funcionan igual
    let totalBase = precioBase * Math.max(dias, 1);

    // EXCEPCIÓN: modo por persona
    if (espacio.modalidadCobro === "POR_PERSONA") {
      totalBase = 0;
    }

    // 3. Personas — LINEAR o MULTIPLICATIVE
    let totalPersonas = 0;

    if (CURRENT_STRATEGY === "LINEAR") {
      totalPersonas = cantidadAdultos * precioPersona;
    } else {
      totalPersonas = cantidadAdultos * precioPersona * dias;
    }

    // 4. Piscina — Siempre proporcional al total de personas piscina
    const totalPiscina = cantidadPiscina * precioPiscina;

    // Total final
    const totalClp = totalBase + totalPersonas + totalPiscina;

    return {
      totalClp,
      snapshot: {
        precioBase,
        precioPersona,
        precioPiscina,
      },
    };
  },
};
