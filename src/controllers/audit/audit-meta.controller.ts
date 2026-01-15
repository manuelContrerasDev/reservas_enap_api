import type { Response } from "express";
import type { AuthRequest } from "@/types/global";
import { AUDIT_ACTIONS } from "@/constants/audit-actions";

export async function auditMetaController(
  req: AuthRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: "NO_AUTH" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ ok: false, error: "NO_AUTORIZADO_ADMIN" });
  }

  return res.json({
    ok: true,
    data: {
      actions: Object.values(AUDIT_ACTIONS),
    },
  });
}
