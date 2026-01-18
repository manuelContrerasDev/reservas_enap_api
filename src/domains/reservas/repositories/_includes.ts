// src/domains/reservas/repositories/_includes.ts

export const reservaBaseInclude = {
  select: {
    /* ============================================================
     * Scalars (explícitos → contrato estable)
     * ============================================================ */
    id: true,
    userId: true,
    tipoEspacio: true,
    espacioId: true,

    fechaInicio: true,
    fechaFin: true,
    dias: true,

    estado: true,
    totalClp: true,

    createdAt: true,
    updatedAt: true,
    expiresAt: true,

    cancelledAt: true,
    cancelledBy: true,

    confirmedAt: true,
    confirmedBy: true,

    socioPresente: true,

    cantidadAdultos: true,
    cantidadNinos: true,
    cantidadPiscina: true,

    precioBaseSnapshot: true,
    precioPersonaSnapshot: true,
    precioPiscinaSnapshot: true,

    nombreSocio: true,
    rutSocio: true,
    telefonoSocio: true,
    correoEnap: true,
    correoPersonal: true,

    usoReserva: true,

    nombreResponsable: true,
    rutResponsable: true,
    emailResponsable: true,
    telefonoResponsable: true,

    comprobanteUrl: true,
    comprobanteName: true,
    comprobanteMime: true,
    comprobanteSize: true,

    terminosAceptados: true,
    terminosVersion: true,

    /* ============================================================
     * Relations
     * ============================================================ */
    espacio: {
      select: {
        id: true,
        nombre: true,
        tipo: true,
        capacidad: true,
        imagenUrl: true,
      },
    },

    invitados: {
      select: {
        id: true,
        nombre: true,
        rut: true,
        edad: true,
        esPiscina: true,
      },
    },

    pago: {
      select: {
        id: true,
        status: true,
        amountClp: true,
        transactionDate: true,
      },
    },
  },
};
