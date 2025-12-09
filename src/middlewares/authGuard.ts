// src/middlewares/authGuard.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { TokenPayload, AuthRequest } from "../types/global";

export const authGuard = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ ok: false, message: "Token requerido" });
    }

    const parts = header.split(" ");

    // 📌 Permitir "Bearer <token>" o "<token>" a secas
    const token = parts.length === 2 ? parts[1] : parts[0];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role as Role,
      name: decoded.name
    };

    next();

  } catch (err: any) {
    return res.status(401).json({
      ok: false,
      message: err.name === "TokenExpiredError"
        ? "Token expirado"
        : "Token inválido",
    });
  }
};

