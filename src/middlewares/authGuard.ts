import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload, AuthRequest } from "../types/global";
import { Role } from "@prisma/client";   // ← 🔥 IMPORT NECESARIO

export const authGuard = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        ok: false,
        message: "Token requerido",
      });
    }

    const parts = header.split(" ");
    const token = parts.length === 2 ? parts[1] : parts[0];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // 🔥 Usuario estándar usado por todos los services
    req.user = {
      id: decoded.sub,          // ← requerido por services Admin
      sub: decoded.sub,         // ← requerido por las reservas del usuario
      email: decoded.email,
      role: decoded.role as Role,
      name: decoded.name,
    };

    next();

  } catch (err: any) {
    return res.status(401).json({
      ok: false,
      message:
        err.name === "TokenExpiredError"
          ? "Token expirado"
          : "Token inválido",
    });
  }
};
