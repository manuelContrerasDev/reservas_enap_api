// ============================================================
// calcularReserva.ts — Motor Oficial ENAP 2025 (Producción)
// ============================================================

import { ModalidadCobro, TipoEspacio, UsoReserva, Role } from "@prisma/client";

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
  role?: Role | null; // null = socio no registrado
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

  // ============================================================
  // Normalizaciones básicas
  // ============================================================

  const diasEfectivos = Math.max(dias, 1);
  const totalPersonas = cantidadAdultos + cantidadNinos;

  // ============================================================
  // 1. Determinar tipo de tarifa
  // ============================================================

  const esExternoReal = role === Role.EXTERNO;

  const pagaComoSocio =
    !esExternoReal &&
    (usoReserva === UsoReserva.USO_PERSONAL ||
      usoReserva === UsoReserva.CARGA_DIRECTA);

  const pagaComoExterno =
    esExternoReal || usoReserva === UsoReserva.TERCEROS;

  if (pagaComoSocio && pagaComoExterno) {
    throw new Error("Regla inválida: conflicto SOCIO / EXTERNO");
  }

  // ============================================================
  // 2. Selección de tarifas
  // ============================================================

  const precioBase = pagaComoSocio
    ? espacio.precioBaseSocio
    : espacio.precioBaseExterno;

  const precioPersona = pagaComoSocio
    ? espacio.precioPersonaAdicionalSocio
    : espacio.precioPersonaAdicionalExterno;

  const precioPiscina = pagaComoSocio
    ? espacio.precioPiscinaSocio
    : espacio.precioPiscinaExterno;

  // ============================================================
  // 3. Precio base (según modalidad)
  // ============================================================

  let precioBaseSnapshot = 0;

  if (
    espacio.modalidadCobro === ModalidadCobro.POR_DIA ||
    espacio.modalidadCobro === ModalidadCobro.POR_NOCHE
  ) {
    precioBaseSnapshot = precioBase * diasEfectivos;
  }

  // POR_PERSONA → no hay base fija

  // ============================================================
  // 4. Precio por personas (TODAS pagan)
  // ============================================================

  const precioPersonaSnapshot = totalPersonas * precioPersona;

  // ============================================================
  // 5. Piscina
  // ============================================================

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
      // Piscina como extra de CABANA / QUINCHO
      const personasPagadas = pagaComoSocio
        ? Math.max(cantidadPiscina - 5, 0) // 5 gratis socio
        : cantidadPiscina;

      precioPiscinaSnapshot = personasPagadas * precioPiscina;
    }
  }

  // ============================================================
  // 6. Total final
  // ============================================================

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
