import { Request, Response } from "express";
import { resetPasswordService } from "../services/auth.service";

export const resetPassword = async (req: Request, res: Response) => {
  await resetPasswordService(req.body);

  return res.json({
    ok: true,
    message: "Contraseña actualizada correctamente",
  });
};
