import { Request, Response } from "express";
import { prisma } from "../../config/db";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { loginSchema } from "../../validators/auth.schema";
import { TokenService } from "../../services/TokenService";

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        code: "USER_NOT_FOUND",
        message: "Correo no registrado",
      });
    }

    if (!user.emailConfirmed) {
      return res.status(403).json({
        ok: false,
        code: "EMAIL_NOT_CONFIRMED",
        message: "Tu correo aún no está confirmado.",
      });
    }

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        code: "INVALID_PASSWORD",
        message: "Contraseña incorrecta",
      });
    }

    const token = TokenService.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

  } catch (error) {
    if (error instanceof ZodError)
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos",
        issues: error.issues,
      });

    console.error("❌ [AUTH login]:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
