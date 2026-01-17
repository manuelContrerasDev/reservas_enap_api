// src/domains/reservas/dto/reserva.dto.ts

import {
  ReservaEstado,
  TipoEspacio,
  UsoReserva,
} from "@prisma/client";

export interface ReservaDTO {
  id: string;

  espacio: {
    id: string;
    nombre: string | null;
    tipo: TipoEspacio | null;
    capacidad: number | null;
  };

  fechaInicio: string;
  fechaFin: string;
  dias: number;

  estado: ReservaEstado;
  totalClp: number;

  // Auditoría
  expiresAt: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;

  // Cantidades
  cantidadAdultos: number;
  cantidadNinos: number;
  cantidadPiscina: number;

  snapshot: {
    precioBase: number | null;
    precioPersona: number | null;
    precioPiscina: number | null;
  };

  socio: {
    nombre: string;
    rut: string;
    telefono: string;
    correoEnap: string | null;
    correoPersonal: string | null;
  };

  usoReserva: UsoReserva;

  responsable: {
    nombre: string;
    rut: string;
    email: string | null;
    telefono: string | null;
  } | null;

  invitados: Array<{
    id: string;
    nombre: string;
    rut: string;
    edad: number | null;
    esPiscina: boolean;
  }>;

  pago: {
    id: string;
    status: string;
    amountClp: number;
    transactionDate: string | null;
  } | null;
}
