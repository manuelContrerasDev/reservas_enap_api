// ============================================================
// calcularReserva.ts — Motor Oficial ENAP 2025 (PRODUCCIÓN)
// ============================================================

import {
  ModalidadCobro,
  TipoEspacio,
  UsoReserva,
  Role,
} from "@prisma/client";

export interface CalculoReservaParams {
  espacio: {
    tipo: TipoEspacio;
    modalidadCobro: ModalidadCobro;

    precioBaseSocio: number;
    precioBaseExterno: number;

    precioPersonaAdicionalSocio: number;
    precioPersonaAdicionalExterno: number;

    precioPiscinaSocio: number;
    precioPiscinaExterno: number;
  };

  dias: number;

  cantidadAdultos: number;
  cantidadNinos: number;
  cantidadPiscina: number;

  usoReserva: UsoReserva;
  role: Role; // 🔒 SIEMPRE definido
}

export function calcularReserva(params: CalculoReservaParams) {
  const {
    espacio,
    dias,
    cantidadAdultos,
    cantidadNinos,
    cantidadPiscina,
    usoReserva,
    role,
  } = params;

  /* =========================================================
   * Normalización
   * ========================================================= */
  const diasEfectivos = Math.max(dias, 1);
  const totalPersonas = cantidadAdultos + cantidadNinos;

  if (totalPersonas < 1) {
    throw new Error("SIN_PERSONAS");
  }

  /* =========================================================
   * Determinar tarifa real
   * ========================================================= */
  const esExterno = role === Role.EXTERNO;

  const pagaComoSocio =
    !esExterno &&
    (usoReserva === UsoReserva.USO_PERSONAL ||
      usoReserva === UsoReserva.CARGA_DIRECTA);

  const pagaComoExterno =
    esExterno || usoReserva === UsoReserva.TERCEROS;

  if (pagaComoSocio && pagaComoExterno) {
    throw new Error("REGLA_TARIFA_INVALIDA");
  }

  /* =========================================================
   * Selección de tarifas
   * ========================================================= */
  const precioBase = pagaComoSocio
    ? espacio.precioBaseSocio
    : espacio.precioBaseExterno;

  const precioPersona = pagaComoSocio
    ? espacio.precioPersonaAdicionalSocio
    : espacio.precioPersonaAdicionalExterno;

  const precioPiscina = pagaComoSocio
    ? espacio.precioPiscinaSocio
    : espacio.precioPiscinaExterno;

  /* =========================================================
   * Precio base
   * ========================================================= */
  let precioBaseSnapshot = 0;

  if (
    espacio.modalidadCobro === ModalidadCobro.POR_DIA ||
    espacio.modalidadCobro === ModalidadCobro.POR_NOCHE
  ) {
    precioBaseSnapshot = precioBase * diasEfectivos;
  }

  /* =========================================================
   * Personas adicionales (1 incluida)
   * ========================================================= */
  const personasAdicionales = Math.max(0, totalPersonas - 1);
  const precioPersonaSnapshot = personasAdicionales * precioPersona;

  /* =========================================================
   * Piscina
   * ========================================================= */
  let precioPiscinaSnapshot = 0;

  if (cantidadPiscina > 0) {
    const esPiscinaPrincipal =
      espacio.tipo === TipoEspacio.PISCINA &&
      espacio.modalidadCobro === ModalidadCobro.POR_PERSONA;

    if (esPiscinaPrincipal) {
      // Piscina como espacio principal → por persona * día
      precioPiscinaSnapshot =
        cantidadPiscina * precioPiscina * diasEfectivos;
    } else {
      // Piscina como extra (cabaña / quincho)
      const personasPagadas = pagaComoSocio
        ? Math.max(cantidadPiscina - 5, 0) // 5 gratis socio
        : cantidadPiscina;

      precioPiscinaSnapshot = personasPagadas * precioPiscina;
    }
  }

  /* =========================================================
   * Total final
   * ========================================================= */
  const totalClp =
    precioBaseSnapshot +
    precioPersonaSnapshot +
    precioPiscinaSnapshot;

  return {
    totalClp,
    precioBaseSnapshot,
    precioPersonaSnapshot,
    precioPiscinaSnapshot,
  };
}
