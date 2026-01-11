import { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/global";
import { Role } from "@prisma/client";

export const roleGuard = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: "NO_AUTH",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: "FORBIDDEN",
        details: {
          required: allowedRoles,
          current: req.user.role,
        },
      });
    }

    next();
  };
};
