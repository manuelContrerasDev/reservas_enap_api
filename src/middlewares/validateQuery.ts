// src/middlewares/validateQuery.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateQuery = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);

      // 🔥 GUARDAMOS QUERY VALIDADA SIN ROMPER req.query
      (req as any).validatedQuery = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          error: "Query inválida",
          details: error.issues,
        });
      }

      return res.status(500).json({
        ok: false,
        error: "Error inesperado en validación de query",
      });
    }
  };
};
