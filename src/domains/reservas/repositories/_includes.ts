// src/domains/reservas/repositories/_includes.ts

export const reservaBaseInclude = {
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
};
