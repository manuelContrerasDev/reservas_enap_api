// src/middlewares/roleGuard.ts
import { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/global";
import { Role } from "@prisma/client";

export const roleGuard = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "No autenticado",
      });
    }

    const userRole = req.user.role as Role;

    if (!Object.values(Role).includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: `Rol no reconocido: ${userRole}`,
      });
    }

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
