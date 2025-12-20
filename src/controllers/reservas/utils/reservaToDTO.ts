// ============================================================
// reservaToDTO - ENAP2025
// ============================================================

export const reservaToDTO = (r: any) => ({
  id: r.id,

  /* --------------------------------------------------------
   * ESPACIO
   * -------------------------------------------------------- */
  espacio: r.espacio
    ? {
        id: r.espacio.id,
        nombre: r.espacio.nombre,
        tipo: r.espacio.tipo,
        capacidad: r.espacio.capacidad ?? null,
      }
    : {
        id: r.espacioId,
        nombre: null,
        tipo: null,
        capacidad: null,
      },

  /* --------------------------------------------------------
   * FECHAS Y ESTADO
   * -------------------------------------------------------- */
  fechaInicio: r.fechaInicio,
  fechaFin: r.fechaFin,
  dias: r.dias,
  estado: r.estado,
  totalClp: r.totalClp,

  /* --------------------------------------------------------
   * CANTIDADES (Nuevo modelo ENAP 2025)
   * -------------------------------------------------------- */
  cantidadAdultos: r.cantidadAdultos ?? 0,
  cantidadNinos: r.cantidadNinos ?? 0,
  cantidadPiscina: r.cantidadPiscina ?? 0,

  /* --------------------------------------------------------
   * SNAPSHOT FINANCIERO (Nuevo)
   * -------------------------------------------------------- */
  snapshot: {
    precioBase: r.precioBaseSnapshot ?? null,
    precioPersona: r.precioPersonaSnapshot ?? null,
    precioPiscina: r.precioPiscinaSnapshot ?? null,
  },

  /* --------------------------------------------------------
   * DATOS DEL SOCIO
   * -------------------------------------------------------- */
  socio: {
    nombre: r.nombreSocio,
    rut: r.rutSocio,
    telefono: r.telefonoSocio,
    correoEnap: r.correoEnap,
    correoPersonal: r.correoPersonal ?? null,
  },

  /* --------------------------------------------------------
   * USO / RESPONSABLE
   * -------------------------------------------------------- */
  usoReserva: r.usoReserva,
  socioPresente: r.socioPresente ?? true,

  responsable: r.socioPresente
    ? null
    : {
        nombre: r.nombreResponsable ?? null,
        rut: r.rutResponsable ?? null,
        email: r.emailResponsable ?? null,
      },

  /* --------------------------------------------------------
   * INVITADOS
   * -------------------------------------------------------- */
  invitados:
    r.invitados?.map((i: any) => ({
      id: i.id,
      nombre: i.nombre,
      rut: i.rut,
      edad: i.edad ?? null,
    })) ?? [],

  /* --------------------------------------------------------
   * PAGO (Webpay) — Nuevo modelo
   * -------------------------------------------------------- */
  pago: r.pago
    ? {
        id: r.pago.id,
        status: r.pago.status,
        buyOrder: r.pago.buyOrder,
        token: r.pago.token ?? null,
        amountClp: r.pago.amountClp,
        transactionDate: r.pago.transactionDate ?? null,
        rawResponse: r.pago.rawResponse ?? null,
      }
    : null,
});
