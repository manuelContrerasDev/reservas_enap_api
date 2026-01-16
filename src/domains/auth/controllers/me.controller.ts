import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { meService } from "../services/auth.service";

export const me = async (req: AuthRequest, res: Response) => {
  const user = await meService(req.user!.id);

  return res.json({ ok: true, user });
};
