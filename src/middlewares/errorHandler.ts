import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

type PrismaLikeError = {
  code?: string;
  meta?: { cause?: string };
  message?: string;
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Log completo solo en server
  console.error("🛑 Error capturado:", err);

  // Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: "Validación fallida",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
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
  if (typeof err?.message === "string" && err.message.includes("CORS")) {
    return res.status(403).json({ ok: false, error: "CORS: origen no permitido" });
  }

  // Prisma (evitar exponer demasiada info)
  const prismaErr = err as PrismaLikeError;
  if (typeof prismaErr?.code === "string" && prismaErr.code.startsWith("P")) {
    return res.status(500).json({
      ok: false,
      error: "Error de base de datos",
      // en prod no conviene exponer cause completa, pero puedes mantenerlo si lo necesitas
      details: prismaErr.meta?.cause ?? "DB_ERROR",
    });
  }

  // Webpay (si está congelado, igual dejamos el handler)
  if (typeof err?.message === "string" && err.message.toLowerCase().includes("webpay")) {
    return res.status(502).json({ ok: false, error: "Error con proveedor de pagos" });
  }

  return res.status(500).json({ ok: false, error: "Error interno del servidor" });
};
