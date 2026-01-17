export const reservaToDTO = (r: any) => ({
  id: r.id,

  // contrato del producto reservado
  tipoEspacio: r.tipoEspacio ?? r.espacio?.tipo ?? null,
  espacioId: r.espacioId ?? null,

  espacio: r.espacio
    ? {
        id: r.espacio.id,
        nombre: r.espacio.nombre,
        tipo: r.espacio.tipo,
        capacidad: r.espacio.capacidad ?? null,
        imagenUrl: r.espacio.imagenUrl ?? null,
      }
    : null,

  fechaInicio: r.fechaInicio?.toISOString?.() ?? r.fechaInicio,
  fechaFin: r.fechaFin?.toISOString?.() ?? r.fechaFin,
  dias: r.dias,

  estado: r.estado,
  totalClp: r.totalClp,

  // auditoría / control
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
  updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,

  expiresAt: r.expiresAt?.toISOString?.() ?? r.expiresAt ?? null,
  cancelledAt: r.cancelledAt?.toISOString?.() ?? r.cancelledAt ?? null,
  cancelledBy: r.cancelledBy ?? null,

  confirmedAt: r.confirmedAt?.toISOString?.() ?? r.confirmedAt ?? null,
  confirmedBy: r.confirmedBy ?? null,

  // pago manual (flujo transferencia)
  comprobante: {
    url: r.comprobanteUrl ?? null,
    name: r.comprobanteName ?? null,
    mime: r.comprobanteMime ?? null,
    size: r.comprobanteSize ?? null,
  },

  // cantidades
  cantidadAdultos: r.cantidadAdultos ?? 0,
  cantidadNinos: r.cantidadNinos ?? 0,
  cantidadPiscina: r.cantidadPiscina ?? 0,

  // snapshot financiero
  snapshot: {
    precioBase: r.precioBaseSnapshot ?? null,
    precioPersona: r.precioPersonaSnapshot ?? null,
    precioPiscina: r.precioPiscinaSnapshot ?? null,
  },

  // quien reserva (puede ser socio o externo)
  solicitante: {
    nombre: r.nombreSocio,
    rut: r.rutSocio,
    telefono: r.telefonoSocio,
    correoEnap: r.correoEnap ?? null,
    correoPersonal: r.correoPersonal ?? null,
  },

  usoReserva: r.usoReserva,

  responsable: r.nombreResponsable
    ? {
        nombre: r.nombreResponsable,
        rut: r.rutResponsable ?? null,
        email: r.emailResponsable ?? null,
        telefono: r.telefonoResponsable ?? null,
      }
    : null,

  invitados:
    r.invitados?.map((i: any) => ({
      id: i.id,
      nombre: i.nombre,
      rut: i.rut,
      edad: i.edad ?? null,
      esPiscina: i.esPiscina ?? false,
    })) ?? [],

  // Pago (si existe) → transactionDate es STRING en tu schema
  pago: r.pago
    ? {
        id: r.pago.id,
        status: r.pago.status,
        amountClp: r.pago.amountClp,
        transactionDate: r.pago.transactionDate ?? null,
      }
    : null,

  terminos: {
    aceptados: r.terminosAceptados ?? null,
    version: r.terminosVersion ?? null,
  },
});
