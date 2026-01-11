// src/controllers/reservas/utils/reservaToDTO.ts
export const reservaToDTO = (r: any) => ({
  id: r.id,

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

  fechaInicio: r.fechaInicio,
  fechaFin: r.fechaFin,
  dias: r.dias,

  estado: r.estado,
  totalClp: r.totalClp,

  // ✅ importantes para auditoría y UI
  expiresAt: r.expiresAt ?? null,
  cancelledAt: r.cancelledAt ?? null,
  cancelledBy: r.cancelledBy ?? null,

  cantidadAdultos: r.cantidadAdultos ?? 0,
  cantidadNinos: r.cantidadNinos ?? 0,
  cantidadPiscina: r.cantidadPiscina ?? 0,

  snapshot: {
    precioBase: r.precioBaseSnapshot ?? null,
    precioPersona: r.precioPersonaSnapshot ?? null,
    precioPiscina: r.precioPiscinaSnapshot ?? null,
  },

  socio: {
    nombre: r.nombreSocio,
    rut: r.rutSocio,
    telefono: r.telefonoSocio,
    correoEnap: r.correoEnap,
    correoPersonal: r.correoPersonal ?? null,
  },

  usoReserva: r.usoReserva,

  responsable:
    r.usoReserva === "USO_PERSONAL"
      ? null
      : {
          nombre: r.nombreResponsable ?? null,
          rut: r.rutResponsable ?? null,
          email: r.emailResponsable ?? null,
        },

  invitados:
    r.invitados?.map((i: any) => ({
      id: i.id,
      nombre: i.nombre,
      rut: i.rut,
      edad: i.edad ?? null,
      esPiscina: i.esPiscina ?? false,
    })) ?? [],

  pago: r.pago
    ? {
        id: r.pago.id,
        status: r.pago.status,
        amountClp: r.pago.amountClp,
        transactionDate: r.pago.transactionDate ?? null,
      }
    : null,
});
