import { Request, Response } from "express";
import { checkResetService } from "../../services/auth/auth.service";

export const checkReset = async (req: Request, res: Response) => {
  await checkResetService(req.query.token as string);

  return res.json({ ok: true, message: "Token válido" });
};
