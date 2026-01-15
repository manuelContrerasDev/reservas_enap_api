// src/services/tesoreria/admin/resumen-tesoreria.service.ts
import { prisma } from "@/lib/db";
import type { AuthUser } from "@/types/global";

interface FiltrosResumen {
  desde?: Date;
  hasta?: Date;
}

export async function resumenTesoreriaService(
  admin: AuthUser,
  filtros: FiltrosResumen = {}
) {
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("NO_AUTORIZADO_ADMIN");
  }

  const where =
    filtros.desde || filtros.hasta
      ? {
          createdAt: {
            ...(filtros.desde && { gte: filtros.desde }),
            ...(filtros.hasta && { lte: filtros.hasta }),
          },
        }
      : undefined;

  const result = await prisma.movimientoTesoreria.aggregate({
    _sum: { montoClp: true },
    _count: { id: true },
    where,
  });

  return {
    totalIngresos: result._sum.montoClp ?? 0,
    totalMovimientos: result._count.id,
  };
}
