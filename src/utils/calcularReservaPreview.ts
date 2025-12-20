// ============================================================
// calcularReservaPreview.ts — Preview Frontend ENAP
// ============================================================

import {
  UsoReserva,
  TipoEspacio,
  ModalidadCobro,
  RolePreview,
} from "@/types/enums";

export interface CalculoReservaPreviewParams {
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
  role?: RolePreview;
}

export interface CalculoReservaPreviewResult {
  totalPreview: number;
  precioBasePreview: number;
  precioPersonaPreview: number;
  precioPiscinaPreview: number;
}

export function calcularReservaPreview(
  params: CalculoReservaPreviewParams
): CalculoReservaPreviewResult {
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

  const esExternoReal = role === "EXTERNO";

  const pagoComoSocio =
    !esExternoReal &&
    (usoReserva === UsoReserva.USO_PERSONAL ||
      usoReserva === UsoReserva.CARGA_DIRECTA);

  const precioBase = pagoComoSocio
    ? espacio.precioBaseSocio
    : espacio.precioBaseExterno;

  const precioPersona = pagoComoSocio
    ? espacio.precioPersonaSocio
    : espacio.precioPersonaExterno;

  const precioPiscina = pagoComoSocio
    ? espacio.precioPiscinaSocio
    : espacio.precioPiscinaExterno;

  let precioBasePreview = 0;

  if (
    espacio.modalidadCobro === ModalidadCobro.POR_NOCHE ||
    espacio.modalidadCobro === ModalidadCobro.POR_DIA
  ) {
    precioBasePreview = precioBase * diasEfectivos;
  }

  const totalPersonas = cantidadAdultos + cantidadNinos;
  const precioPersonaPreview = totalPersonas * precioPersona;

  let precioPiscinaPreview = 0;

  if (cantidadPiscina > 0) {
    const esPiscinaPrincipal =
      espacio.tipo === TipoEspacio.PISCINA &&
      espacio.modalidadCobro === ModalidadCobro.POR_PERSONA;

    if (!esPiscinaPrincipal) {
      const pagadas = pagoComoSocio
        ? Math.max(cantidadPiscina - 5, 0)
        : cantidadPiscina;

      precioPiscinaPreview = pagadas * precioPiscina;
    } else {
      precioPiscinaPreview =
        cantidadPiscina * precioPiscina * diasEfectivos;
    }
  }

  const totalPreview =
    precioBasePreview +
    precioPersonaPreview +
    precioPiscinaPreview;

  return {
    totalPreview,
    precioBasePreview,
    precioPersonaPreview,
    precioPiscinaPreview,
  };
}
