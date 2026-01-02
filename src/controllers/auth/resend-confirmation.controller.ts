import { Request, Response } from "express";
import { ZodError } from "zod";
import { resendConfirmationSchema } from "../../validators/auth.schema";
import { resendConfirmationService } from "../../services/auth/auth.service";

export const resendConfirmation = async (req: Request, res: Response) => {
  try {
    const { email } = resendConfirmationSchema.parse(req.body);

    await resendConfirmationService(email);

    return res.json({
      ok: true,
      message: "Si la cuenta existe, se enviará un nuevo enlace.",
    });

  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ ok: false, issues: error.issues });
    }

    if (error.message === "EMAIL_ALREADY_CONFIRMED") {
      return res.status(400).json({
        ok: false,
        message: "El correo ya está confirmado",
      });
    }

    console.error("❌ [AUTH resendConfirmation]:", error);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
