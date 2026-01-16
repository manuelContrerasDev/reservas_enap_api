import type { Response } from "express";
import type { AuthRequest } from "@/types/global";
import { listarAuditLogsService } from "@/domains/audit/services/listar-audit-logs.service";
import { AUDIT_ACTIONS, type AuditAction } from "@/constants/audit-actions";

function parseAuditAction(value?: string): AuditAction | undefined {
  if (!value) return undefined;
  if (Object.values(AUDIT_ACTIONS).includes(value as AuditAction)) {
    return value as AuditAction;
  }
  throw new Error("AUDIT_ACTION_INVALIDA");
}

export async function listarAuditLogsController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "NO_AUTH" });
    }

    const { action, entity, userId, desde, hasta, cursor, limit } = req.query as {
      action?: string;
      entity?: string;
      userId?: string;
      desde?: string;
      hasta?: string;
      cursor?: string;
      limit?: string;
    };

    const result = await listarAuditLogsService(
      req.user,
      {
        action: parseAuditAction(action),
        entity,
        userId,
        desde: desde ? new Date(desde) : undefined,
        hasta: hasta
          ? (() => {
              const d = new Date(hasta);
              d.setHours(23, 59, 59, 999);
              return d;
            })()
          : undefined,
      },
      {
        cursor,
        limit: limit ? Number(limit) : undefined,
      }
    );

    return res.json({ ok: true, ...result });
  } catch (e: any) {
    const map: Record<string, number> = {
      NO_AUTORIZADO_ADMIN: 403,
      AUDIT_ACTION_INVALIDA: 400,
    };

    return res
      .status(map[e.message] ?? 500)
      .json({ ok: false, error: e.message ?? "INTERNAL_ERROR" });
  }
}
