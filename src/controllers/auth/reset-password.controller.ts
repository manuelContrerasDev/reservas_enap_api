import { Request, Response } from "express";
import { ZodError } from "zod";
import { resetPasswordSchema } from "../../validators/auth.schema";
import { resetPasswordService } from "../../services/auth/auth.service";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    await resetPasswordService(data);

    return res.json({
      ok: true,
      message: "Contraseña actualizada correctamente",
    });

  } catch (error: any) {
    if (error instanceof ZodError || error.message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({
        ok: false,
        message: "Token inválido o expirado",
      });
    }

    console.error("❌ [AUTH resetPassword]:", error);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
