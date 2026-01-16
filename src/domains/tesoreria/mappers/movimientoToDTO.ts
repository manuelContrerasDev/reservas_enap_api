// src/utils/tesoreria/movimientoToDTO.ts
import type { MovimientoTesoreriaDTO } from "@/types/tesoreria.dto";

type PrismaMovimiento = {
  id: string;
  createdAt: Date;
  montoClp: number;
  referencia: string | null;
  nota: string | null;
  reserva: {
    id: string;
    nombreSocio: string;
    espacio: { nombre: string };
  };
  creadoPor: {
    id: string;
    name: string | null;
    email: string;
  };
};

export function movimientoToDTO(m: PrismaMovimiento): MovimientoTesoreriaDTO {
  return {
    id: m.id,
    createdAt: m.createdAt,
    montoClp: m.montoClp,
    referencia: m.referencia,
    nota: m.nota,
    reserva: {
      id: m.reserva.id,
      nombreSocio: m.reserva.nombreSocio,
      espacio: { nombre: m.reserva.espacio.nombre },
    },
    creadoPor: {
      id: m.creadoPor.id,
      name: m.creadoPor.name,
      email: m.creadoPor.email,
    },
  };
}
