// src/services/tesoreria/admin/listar-movimientos.service.ts

import { prisma } from "../../../lib/db";
import type { AuthUser } from "../../../types/global";
import type { MovimientoTesoreriaDTO } from "../../../types/tesoreria.dto";

import { movimientoToDTO } from "../../../utils/tesoreria/movimientoToDTO";

export interface FiltrosTesoreriaService {
  desde?: Date;
  hasta?: Date;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function listarMovimientosTesoreriaService(
  admin: AuthUser,
  filtros: FiltrosTesoreriaService
): Promise<MovimientoTesoreriaDTO[]> {
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("NO_AUTORIZADO_ADMIN");
  }

  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};

  if (filtros.desde || filtros.hasta) {
    where.createdAt = {};
    if (filtros.desde) where.createdAt.gte = startOfDay(filtros.desde);
    if (filtros.hasta) where.createdAt.lte = endOfDay(filtros.hasta);
  }

  const movimientos = await prisma.movimientoTesoreria.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      reserva: {
        select: {
          id: true,
          nombreSocio: true,
          espacio: { select: { nombre: true } },
        },
      },
      creadoPor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return movimientos.map(movimientoToDTO);
}
