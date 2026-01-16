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

  fechaInicio: r.fechaInicio.toISOString(),
  fechaFin: r.fechaFin.toISOString(),
  dias: r.dias,

  estado: r.estado,
  totalClp: r.totalClp,

  // ======================
  // Auditoría / control
  // ======================
  expiresAt: r.expiresAt?.toISOString() ?? null,
  cancelledAt: r.cancelledAt?.toISOString() ?? null,
  cancelledBy: r.cancelledBy ?? null,

  // ======================
  // Cantidades
  // ======================
  cantidadAdultos: r.cantidadAdultos ?? 0,
  cantidadNinos: r.cantidadNinos ?? 0,
  cantidadPiscina: r.cantidadPiscina ?? 0,

  // ======================
  // Snapshot financiero
  // ======================
  snapshot: {
    precioBase: r.precioBaseSnapshot ?? null,
    precioPersona: r.precioPersonaSnapshot ?? null,
    precioPiscina: r.precioPiscinaSnapshot ?? null,
  },

  // ======================
  // Socio
  // ======================
  socio: {
    nombre: r.nombreSocio,
    rut: r.rutSocio,
    telefono: r.telefonoSocio,
    correoEnap: r.correoEnap,
    correoPersonal: r.correoPersonal ?? null,
  },

  usoReserva: r.usoReserva,

  // ======================
  // Responsable (solo si existe)
  // ======================
  responsable:
    r.nombreResponsable
      ? {
          nombre: r.nombreResponsable,
          rut: r.rutResponsable,
          email: r.emailResponsable,
          telefono: r.telefonoResponsable,
        }
      : null,

  // ======================
  // Invitados
  // ======================
  invitados:
    r.invitados?.map((i: any) => ({
      id: i.id,
      nombre: i.nombre,
      rut: i.rut,
      edad: i.edad ?? null,
      esPiscina: i.esPiscina ?? false,
    })) ?? [],

  // ======================
  // Pago (si existe)
  // ======================
  pago: r.pago
    ? {
        id: r.pago.id,
        status: r.pago.status,
        amountClp: r.pago.amountClp,
        transactionDate:
          r.pago.transactionDate?.toISOString() ?? null,
      }
    : null,
});
