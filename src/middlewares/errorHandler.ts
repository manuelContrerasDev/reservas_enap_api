// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🛑 Error capturado:", err);

  // Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: "Validación fallida",
      details: err.issues,
    });
  }

  // JWT
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ ok: false, error: "Token expirado" });
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ ok: false, error: "Token inválido" });
  }

  // CORS
  if (err.message?.includes("CORS")) {
    return res.status(403).json({
      ok: false,
      error: "CORS bloqueado: origen no permitido",
    });
  }

  // Prisma
  if (err.code?.startsWith("P")) {
    return res.status(500).json({
      ok: false,
      error: "Error de base de datos",
      details: err.meta?.cause || err.message,
    });
  }

  // Webpay
  if (err.message?.includes("Webpay")) {
    return res.status(502).json({
      ok: false,
      error: "Error con Webpay",
      details: err.message,
    });
  }

  // Default
  return res.status(500).json({
    ok: false,
    error: "Error interno del servidor",
  });
};
