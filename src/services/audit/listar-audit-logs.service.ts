import { prisma } from "@/lib/db";
import type { AuthUser } from "@/types/global";
import type { Prisma } from "@prisma/client";
import type { AuditAction } from "@/constants/audit-actions";

export interface AuditLogFiltros {
  action?: AuditAction;
  entity?: string;
  userId?: string;
  desde?: Date;
  hasta?: Date;
}

export interface ListAuditLogsOptions {
  limit?: number;
  cursor?: string; // auditLog.id
}

export async function listarAuditLogsService(
  admin: AuthUser,
  filtros: AuditLogFiltros,
  opts: ListAuditLogsOptions = {}
) {
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("NO_AUTORIZADO_ADMIN");
  }

  const where: Prisma.AuditLogWhereInput = {};

  if (filtros.action) where.action = filtros.action;
  if (filtros.entity) where.entity = filtros.entity;
  if (filtros.userId) where.userId = filtros.userId;

  if (filtros.desde || filtros.hasta) {
    where.createdAt = {};
    if (filtros.desde) where.createdAt.gte = filtros.desde;
    if (filtros.hasta) where.createdAt.lte = filtros.hasta;
  }

  const take = Math.min(opts.limit ?? 50, 200);

  const logs = await prisma.auditLog.findMany({
    where,
    take: take + 1, // 👈 para detectar nextCursor
    ...(opts.cursor && {
      cursor: { id: opts.cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const hasNext = logs.length > take;
  const data = hasNext ? logs.slice(0, take) : logs;

  return {
    data,
    nextCursor: hasNext ? data[data.length - 1].id : null,
  };
}
