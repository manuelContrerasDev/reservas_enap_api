import { Response } from "express";
import type { AuthRequest } from "../../types/global";
import { meService } from "../../services/auth/auth.service";

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "No autenticado" });
    }

    const user = await meService(req.user.id);

    return res.json({ ok: true, user });

  } catch (error) {
    console.error("❌ [AUTH me]:", error);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
