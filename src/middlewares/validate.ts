// src/middlewares/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * ============================================================
 * 🧩 validate(schema)
 * Middleware para validar SOLO req.body (tu caso actual)
 * 
 * Se alinea con tus schemas:
 * registerSchema
 * loginSchema
 * resetRequestSchema
 * resetPasswordSchema
 * 
 * Todos ellos validan "body" plano, NO { body: {...} }
 * ============================================================
 */
export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    try {
      const parsed = schema.parse(req.body);

      // ⚠ Express tiene req.body como readonly → creamos copia mutable
      (req as any).body = parsed;

      next();

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          error: "Datos inválidos",
          details: error.issues.map(issue => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      return res.status(500).json({
        ok: false,
        error: "Error inesperado en validación",
      });
    }
  };
};
