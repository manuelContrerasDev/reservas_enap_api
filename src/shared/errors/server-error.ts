import { Response } from "express";

export const handleServerError = (where: string, error: any, res: Response) => {
  console.error(`❌ [AUTH ${where}]:`, error);

  return res.status(500).json({
    ok: false,
    message: "Error interno del servidor",
  });
};
