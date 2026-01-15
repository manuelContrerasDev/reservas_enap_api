// src/types/tesoreria.dto.ts

export interface MovimientoTesoreriaDTO {
  id: string;
  createdAt: Date;

  montoClp: number;
  referencia: string | null;
  nota: string | null;

  reserva: {
    id: string;
    nombreSocio: string;
    espacio: {
      nombre: string;
    };
  };

  creadoPor: {
    id: string;
    name: string | null;
    email: string;
  };
}
