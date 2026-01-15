// src/services/tesoreria/admin/export-movimientos.service.ts
import { prisma } from "@/lib/db";
import type { AuthUser } from "@/types/global";

interface ExportFiltros {
  desde?: Date;
  hasta?: Date;
}

export async function exportMovimientosTesoreriaService(
  admin: AuthUser,
  filtros: ExportFiltros
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

  return prisma.movimientoTesoreria.findMany({
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
        select: { name: true, email: true },
      },
    },
  });
}
