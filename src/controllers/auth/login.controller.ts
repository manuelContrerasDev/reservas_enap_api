import { Request, Response } from "express";
import { ZodError } from "zod";
import { loginSchema } from "../../validators/auth.schema";
import { loginService } from "../../services/auth/auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginService(data);

    // ❌ LOGIN FALLIDO (controlado)
    if (!result.ok) {
      return res.status(
        result.code === "EMAIL_NOT_CONFIRMED" ? 403 : 401
      ).json(result);
    }

    // ✅ LOGIN OK
    return res.json(result);

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        code: "INVALID_DATA",
        message: "Datos inválidos",
        issues: error.issues,
      });
    }

    console.error("❌ [AUTH login]:", error);
    return res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor",
    });
  }
};
