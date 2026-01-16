import { Request, Response } from "express";
import { confirmEmailService } from "../services/auth.service";

export const confirmEmail = async (req: Request, res: Response) => {
  await confirmEmailService(req.query.token as string);

  return res.json({
    ok: true,
    message: "Correo confirmado correctamente 🎉",
  });
};
