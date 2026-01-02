import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, TokenPayload } from "../types/global";
import { Role } from "@prisma/client";
import { env } from "../config/env";

function extractBearerToken(header?: string) {
  if (!header) return null;
  const parts = header.trim().split(/\s+/);

  // "Bearer <token>"
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];

  // fallback: si mandan solo el token
  if (parts.length === 1) return parts[0];

  return null;
}

export const authGuard = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ ok: false, error: "Token requerido" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    // Normalizamos el user en req.user (contrato único para services)
    req.user = {
      id: decoded.sub,
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role as Role,
      name: decoded.name,
    };

    return next();
  } catch (err: any) {
    return res.status(401).json({
      ok: false,
      error: err?.name === "TokenExpiredError" ? "Token expirado" : "Token inválido",
    });
  }
};
