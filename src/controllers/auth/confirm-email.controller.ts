import { Request, Response } from "express";
import { prisma } from "../../config/db";

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({
        ok: false,
        message: "Token requerido",
      });
    }

    const user = await prisma.user.findFirst({
      where: { emailConfirmToken: token },
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "Token inválido o ya utilizado",
      });
    }

    if (user.emailConfirmed) {
      return res.json({
        ok: false,
        code: "ALREADY_CONFIRMED",
        message: "Tu correo ya está confirmado.",
        alreadyVerified: true,
      });
    }

    if (user.emailConfirmExpires && user.emailConfirmExpires < new Date()) {
      return res.status(400).json({
        ok: false,
        code: "EXPIRED",
        message: "Token expirado",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        emailConfirmToken: null,
        emailConfirmExpires: null,
      },
    });

    return res.json({
      ok: true,
      code: "CONFIRMED",
      message: "Correo confirmado correctamente 🎉",
    });
  } catch (error) {
    console.error("❌ [AUTH confirmEmail]:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
