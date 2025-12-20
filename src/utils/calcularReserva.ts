// ============================================================
// calcularReserva.ts — Motor Oficial ENAP 2025 (Producción)
// ============================================================
//
// Reglas clave:
// ------------------------------------------------------------
// SOCIO paga precio SOCIO cuando:
//  - usoReserva = USO_PERSONAL
//  - usoReserva = CARGA_DIRECTA
//
// SOCIO paga precio EXTERNO cuando:
//  - usoReserva = TERCEROS
//
// EXTERNO paga siempre precio EXTERNO (role = EXTERNO)
//
// Modalidades:
//  - POR_NOCHE   → base * días
//  - POR_DIA     → base * días
//  - POR_PERSONA → solo tarifas por persona (base = 0)
//
// Piscina:
//  - CABANA/QUINCHO con acceso a piscina:
//      • SOCIO → primeras 5 personas piscina gratis por reserva
//      • EXTERNO → todas pagadas
//      • Se cobra una sola vez (no por día).
//
//  - PISCINA como espacio principal (tipo = PISCINA + POR_PERSONA):
//      • NO aplica beneficio de 5 gratis
//      • Se cobra cantidadPiscina * precioPiscina * días
//
// Niños:
//  - Los >= 12 años ya deben venir contados en cantidadAdultos
//    (regla aplicada en el servicio que arma estos parámetros)
//
// Compatible con:
//  - SOCIO no registrado (role = null)
//  - EXTERNO registrado
//  - Reservas manuales y automáticas
// ============================================================

import { ModalidadCobro, TipoEspacio, UsoReserva, Role } from "@prisma/client";

export interface CalculoReservaParams {
  espacio: {
    tipo: TipoEspacio;
    modalidadCobro: ModalidadCobro;

    precioBaseSocio: number;
    precioBaseExterno: number;

    precioPersonaSocio: number;
    precioPersonaExterno: number;

    precioPiscinaSocio: number;
    precioPiscinaExterno: number;
  };

  dias: number;

  cantidadAdultos: number;
  cantidadNinos: number;
  cantidadPiscina: number;

  usoReserva: UsoReserva;
  role?: Role | null; // null → SOCIO no registrado
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

  const diasEfectivos = Math.max(dias, 1);

  // ============================================================
  // 1. Determinar si paga como SOCIO o EXTERNO
  // ============================================================

  const esExternoReal = role === "EXTERNO";

  // SOCIO paga tarifa SOCIO excepto cuando usoReserva = TERCEROS
  const pagoComoSocio =
    !esExternoReal &&
    (usoReserva === "USO_PERSONAL" || usoReserva === "CARGA_DIRECTA");

  // EXTERNO real O TERCEROS → tarifa EXTERNO
  const pagoComoExterno = esExternoReal || usoReserva === "TERCEROS";

  if (pagoComoSocio && pagoComoExterno) {
    throw new Error("Regla inconsistente: socio y externo simultáneo.");
  }

  const precioBase = pagoComoSocio
    ? espacio.precioBaseSocio
    : espacio.precioBaseExterno;

  const precioPersona = pagoComoSocio
    ? espacio.precioPersonaSocio
    : espacio.precioPersonaExterno;

  const precioPiscina = pagoComoSocio
    ? espacio.precioPiscinaSocio
    : espacio.precioPiscinaExterno;

  // ============================================================
  // 2. BASE según modalidad de cobro
  // ============================================================

  let precioBaseSnapshot = 0;

  if (
    espacio.modalidadCobro === ModalidadCobro.POR_NOCHE ||
    espacio.modalidadCobro === ModalidadCobro.POR_DIA
  ) {
    // CABANA / QUINCHO → base por día/noche * días
    precioBaseSnapshot = precioBase * diasEfectivos;
  }

  if (espacio.modalidadCobro === ModalidadCobro.POR_PERSONA) {
    // Ej: PISCINA como espacio principal → sin base fija
    precioBaseSnapshot = 0;
  }

  // ============================================================
  // 3. TARIFA POR PERSONA (adultos + niños < 12)
  // ============================================================

  const totalPersonas = cantidadAdultos + cantidadNinos;
  const precioPersonaSnapshot = totalPersonas * precioPersona;

  // ============================================================
  // 4. PISCINA
  // ============================================================

  let precioPiscinaSnapshot = 0;

  if (cantidadPiscina > 0) {
    let cantidadPagadasPiscina = cantidadPiscina;

    const esPiscinaPrincipal =
      espacio.tipo === TipoEspacio.PISCINA &&
      espacio.modalidadCobro === ModalidadCobro.POR_PERSONA;

    if (!esPiscinaPrincipal) {
      // Piscina como extra de CABANA/QUINCHO:
      // SOCIO tiene 5 gratis por reserva
      cantidadPagadasPiscina = pagoComoSocio
        ? Math.max(cantidadPiscina - 5, 0)
        : cantidadPiscina;

      // Se cobra una sola vez por reserva (no por día)
      precioPiscinaSnapshot = cantidadPagadasPiscina * precioPiscina;
    } else {
      // Piscina como espacio principal:
      // NO hay 5 gratis → se paga desde la primera persona
      // y es por día * persona
      cantidadPagadasPiscina = cantidadPiscina;
      precioPiscinaSnapshot =
        cantidadPagadasPiscina * precioPiscina * diasEfectivos;
    }
  }

  // ============================================================
  // 5. TOTAL FINAL
  // ============================================================

  const totalClp =
    precioBaseSnapshot + precioPersonaSnapshot + precioPiscinaSnapshot;

  return {
    totalClp,
    precioBaseSnapshot,
    precioPersonaSnapshot,
    precioPiscinaSnapshot,
  };
}
