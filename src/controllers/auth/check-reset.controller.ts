import { Request, Response } from "express";
import { ZodError } from "zod";
import { checkResetSchema } from "../../validators/auth.schema";
import { checkResetService } from "../../services/auth/auth.service";

export const checkReset = async (req: Request, res: Response) => {
  try {
    const { token } = checkResetSchema.parse(req.query);

    await checkResetService(token);

    return res.json({ ok: true, message: "Token válido" });

  } catch (error: any) {
    if (error instanceof ZodError || error.message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({
        ok: false,
        message: "Token inválido o expirado",
      });
    }

    console.error("❌ [AUTH checkReset]:", error);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
