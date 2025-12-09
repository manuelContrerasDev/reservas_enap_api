// src/middlewares/validateParams.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateParams = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      (req as any).validatedParams = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          error: "Parámetros inválidos",
          details: error.issues,
        });
      }

      return res.status(500).json({
        ok: false,
        error: "Error inesperado en validación de parámetros",
      });
    }
  };
};
