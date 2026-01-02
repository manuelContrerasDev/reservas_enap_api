import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      (req as any).validatedQuery = parsed;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
