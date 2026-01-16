// src/services/espacios/socio/productos/disponibilidad-producto.service.ts
import { TipoEspacio } from "@prisma/client";
import {
  EspaciosRepository,
  DisponibilidadEspacioRepository,
} from "@/domains/espacios/repositories";

interface DisponibilidadProductoResult {
  tipo: TipoEspacio;
  totalUnidades: number;
  unidadesDisponibles: number;
  reservable: boolean;
}

export async function disponibilidadProductoService(
  tipo: TipoEspacio,
  fechaInicioISO: string,
  fechaFinISO: string
): Promise<DisponibilidadProductoResult> {
  const inicio = new Date(fechaInicioISO);
  const fin = new Date(fechaFinISO);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new Error("FECHAS_INVALIDAS");
  }

  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  if (inicio > fin) {
    throw new Error("RANGO_INVALIDO");
  }

  // 1️⃣ Obtener todas las unidades del producto
  const espacios = await EspaciosRepository.findMany(
    { tipo, activo: true, visible: true },
    { nombre: "asc" }
  );

  const totalUnidades = espacios.length;
  if (totalUnidades === 0) {
    return {
      tipo,
      totalUnidades: 0,
      unidadesDisponibles: 0,
      reservable: false,
    };
  }

  // 2️⃣ Marcar unidades ocupadas (una por unidad)
  let ocupadas = 0;

  for (const espacio of espacios) {
    const reservasActivas =
      await DisponibilidadEspacioRepository.contarReservasSolapadas(
        espacio.id,
        inicio,
        fin
      );

    if (reservasActivas > 0) ocupadas++;
  }

  const unidadesDisponibles = Math.max(0, totalUnidades - ocupadas);

  return {
    tipo,
    totalUnidades,
    unidadesDisponibles,
    reservable: unidadesDisponibles > 0,
  };
}
