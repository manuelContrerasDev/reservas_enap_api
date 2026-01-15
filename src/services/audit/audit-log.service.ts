import type { Prisma } from "@prisma/client";
import type { AuthUser } from "@/types/global";
import { prisma as defaultPrisma } from "@/lib/db";
import type { AuditAction } from "@/constants/audit-actions";

type PrismaLike = {
  auditLog: {
    create: (args: Prisma.AuditLogCreateArgs) => Promise<unknown>;
  };
};

interface CreateAuditLogParams {
  action: AuditAction; // ✅ tipado fuerte
  entity: string;
  entityId: string;

  actor?: AuthUser | null;
  ipAddress?: string | null;

  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  details?: Prisma.InputJsonValue;

  client?: PrismaLike; // prisma o tx
}

export async function createAuditLogService({
  action,
  entity,
  entityId,
  actor,
  ipAddress,
  before,
  after,
  details,
  client,
}: CreateAuditLogParams) {
  const db = client ?? defaultPrisma;

  try {
    await db.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: actor?.id ?? null,
        ipAddress: ipAddress ?? null,
        before: before ?? undefined,
        after: after ?? undefined,
        details: details ?? undefined,
      },
    });
  } catch (error) {
    // 🔒 nunca rompe flujo principal
    console.error("[AUDIT_WRITE_FAILED]", {
      action,
      entity,
      entityId,
      error,
    });
  }
}
