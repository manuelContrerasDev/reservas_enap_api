import { Request, Response } from "express";
import { ZodError } from "zod";
import { registerSchema } from "../../validators/auth.schema";
import { registerService } from "../../services/auth/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await registerService(data);

    return res.status(201).json({
      ok: true,
      message: result.message,
    });

  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ ok: false, issues: error.issues });
    }

    if (error.message === "EMAIL_ALREADY_REGISTERED") {
      return res.status(400).json({
        ok: false,
        message: "Este correo ya está registrado",
      });
    }

    console.error("❌ [AUTH register]:", error);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
