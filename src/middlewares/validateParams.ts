import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      (req as any).validatedParams = parsed;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
