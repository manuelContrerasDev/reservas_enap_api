// src/middlewares/roleGuard.ts
import { Response, NextFunction } from "express";
import type { AuthRequest, UserRole } from "../types/global";

export const roleGuard = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "No autenticado",
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: `Acceso denegado. Requiere: ${allowedRoles.join(
          " o "
        )}, tu rol: ${userRole}`,
      });
    }

    next();
  };
};
