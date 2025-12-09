// src/services/reservas/helpers.ts

export const reservaToDTO = (r: any) => ({
  id: r.id,

  espacioId: r.espacio?.id ?? r.espacioId ?? null,
  espacioNombre: r.espacio?.nombre ?? null,
  espacioTipo: r.espacio?.tipo ?? null,

  fechaInicio: r.fechaInicio,
  fechaFin: r.fechaFin,
  dias: r.dias,
  cantidadPersonas: r.cantidadPersonas,
  totalClp: r.totalClp,

  estado: r.estado,

  usuario: {
    id: r.user?.id ?? null,
    nombre: r.user?.name ?? null,
    email: r.user?.email ?? null,
  },

  nombreSocio: r.nombreSocio,
  rutSocio: r.rutSocio,
  telefonoSocio: r.telefonoSocio,
  correoEnap: r.correoEnap,
  correoPersonal: r.correoPersonal ?? null,

  invitados:
    r.invitados?.map((i: any) => ({
      id: i.id,
      nombre: i.nombre,
      rut: i.rut ?? null,
      edad: i.edad ?? null,
    })) ?? [],

  pago: r.pago
    ? {
        id: r.pago.id,
        status: r.pago.status,
        amountClp: r.pago.amountClp,
        token: r.pago.token ?? null,
        transactionDate: r.pago.transactionDate ?? null,
        rawResponse: r.pago.rawResponse ?? null,
      }
    : null,
});
