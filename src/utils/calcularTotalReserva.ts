// src/utils/calcularTotalReserva.ts

import { UsoReserva } from "@prisma/client";

interface Invitado {
  edad?: number | null;
}

interface Params {
  espacio: {
    tipo: "CABANA" | "QUINCHO" | "PISCINA";
    tarifaClp: number | null;       // socio
    tarifaExterno: number | null;   // externo
  };
  dias: number;                       // días totales (1 para piscina)
  invitados: Invitado[];              // lista completa
  cantidadPersonasPiscina: number;    // cuántas usan piscina
  usoReserva: UsoReserva | "USO_PERSONAL" | "CARGA_DIRECTA" | "TERCEROS";
}

export function calcularTotalReserva({
  espacio,
  dias,
  invitados,
  cantidadPersonasPiscina,
  usoReserva,
}: Params) {

  // ============================================================
  // 1. SOCIO o EXTERNO según usoReserva
  // ============================================================
  const esSocio =
    usoReserva === "USO_PERSONAL" || usoReserva === "CARGA_DIRECTA";

  // ============================================================
  // 2. Tarifas base oficiales
  // ============================================================

  // Base socio viene de BD → tarifaClp
  const tarifaBaseSocio = espacio.tarifaClp ?? 0;

  // Base externo → tarifaExterno (OBLIGATORIO)
  const tarifaBaseExterno =
    espacio.tarifaExterno ??
    (espacio.tipo === "CABANA"
      ? 60000
      : espacio.tipo === "QUINCHO"
      ? 30000
      : 0);

  // Determinar base correcta
  const tarifaBaseAplicada = esSocio ? tarifaBaseSocio : tarifaBaseExterno;

  // Piscina NO tiene base
  const base =
    espacio.tipo === "PISCINA" ? 0 : tarifaBaseAplicada * Math.max(dias, 1);

  // ============================================================
  // 3. Invitados — pagan solo >= 13 años
  // ============================================================
  const mayores = invitados.filter((i) => (i.edad ?? 13) >= 13).length;

  const TARIFA_INVITADO_SOCIO = 3500;  // socio paga 3500
  const TARIFA_INVITADO_EXTERNO = 4000; // externo siempre 4000

  const totalInvitados = esSocio
    ? mayores * TARIFA_INVITADO_SOCIO
    : mayores * TARIFA_INVITADO_EXTERNO;

  // ============================================================
  // 4. Piscina — regla oficial
  // ============================================================
  const TARIFA_PISCINA_SOCIO = 3500;
  const TARIFA_PISCINA_EXTERNO = 4500;

  let totalPiscina = 0;

  if (esSocio) {
    // Primeras 5 personas gratis (socios)
    const excedentes = Math.max(0, cantidadPersonasPiscina - 5);
    totalPiscina = excedentes * TARIFA_PISCINA_SOCIO;
  } else {
    // Externo paga todas
    totalPiscina = cantidadPersonasPiscina * TARIFA_PISCINA_EXTERNO;
  }

  // ============================================================
  // 5. TOTAL FINAL
  // ============================================================
  const totalClp = base + totalInvitados + totalPiscina;

  return {
    totalClp,
    detalle: {
      esSocio,
      dias,
      base,
      totalInvitados,
      totalPiscina,
      tarifas: {
        base: tarifaBaseAplicada,
        invitado: esSocio ? TARIFA_INVITADO_SOCIO : TARIFA_INVITADO_EXTERNO,
        piscina: esSocio ? TARIFA_PISCINA_SOCIO : TARIFA_PISCINA_EXTERNO,
      },
    },
  };
}
