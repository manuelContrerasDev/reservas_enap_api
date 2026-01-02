import { Request, Response } from "express";
import { ZodError } from "zod";
import { resetRequestSchema } from "../../validators/auth.schema";
import { requestResetService } from "../../services/auth/auth.service";

export const requestReset = async (req: Request, res: Response) => {
  try {
    const { email } = resetRequestSchema.parse(req.body);

    await requestResetService(email);

    return res.json({
      ok: true,
      message:
        "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ ok: false, issues: error.issues });
    }

    console.error("❌ [AUTH requestReset]:", error);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
