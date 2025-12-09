// src/controllers/auth/reset-request.controller.ts

import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { ZodError } from "zod";
import { resetRequestSchema } from "../../validators/auth.schema";
import { TokenService } from "../../services/TokenService";
import { EmailService } from "../../services/EmailService";

const RESET_EXPIRES_MS = 30 * 60 * 1000; // 30 minutos

export const requestReset = async (req: Request, res: Response) => {
  try {
    // Validación zod
    const { email } = resetRequestSchema.parse(req.body);

    // Normalización completa
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 🔒 No revelar si existe o no
    if (!user) {
      return res.json({
        ok: true,
        message:
          "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
      });
    }

    // Eliminar tokens antiguos
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Crear token nuevo
    const token = TokenService.generateToken(32);
    const expiresAt = TokenService.expiresIn(RESET_EXPIRES_MS);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // URL del frontend
    const resetUrl = `${process.env.WEB_URL}/auth/reset-confirm?token=${token}`;

    // Enviar correo
    await EmailService.sendResetPasswordEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return res.json({
      ok: true,
      message:
        "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos",
        issues: error.issues,
      });
    }

    console.error("❌ [AUTH requestReset]:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
