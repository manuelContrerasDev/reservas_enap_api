import { Request, Response } from "express";
import { confirmEmailService } from "../../services/auth/auth.service";

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;

    await confirmEmailService(token);

    return res.json({
      ok: true,
      message: "Correo confirmado correctamente 🎉",
    });

  } catch (error: any) {
    if (error.message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({
        ok: false,
        message: "Token inválido o expirado",
      });
    }

    console.error("❌ [AUTH confirmEmail]:", error);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
