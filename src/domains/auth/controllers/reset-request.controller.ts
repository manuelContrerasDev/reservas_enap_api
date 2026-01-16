import { Request, Response } from "express";
import { requestResetService } from "../services/auth.service";

export const requestReset = async (req: Request, res: Response) => {
  await requestResetService(req.body.email);

  return res.json({
    ok: true,
    message:
      "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
  });
};
