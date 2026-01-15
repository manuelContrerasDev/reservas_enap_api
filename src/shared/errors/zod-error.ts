import { ZodError } from "zod";
import { Response } from "express";

export const handleZodError = (error: ZodError, res: Response) => {
  return res.status(400).json({
    ok: false,
    message: "Datos inválidos",
    issues: error.issues,
  });
};
