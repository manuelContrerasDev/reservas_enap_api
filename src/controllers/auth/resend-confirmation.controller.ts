// src/controllers/auth/resend-confirmation.controller.ts

import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { TokenService } from "../../services/TokenService";
import { EmailService } from "../../services/EmailService";

const EMAIL_CONFIRM_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24h

export const resendConfirmation = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        code: "EMAIL_REQUIRED",
        message: "Correo requerido",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Caso seguro: Usuario no existe → siempre ok para evitar enumeración
    if (!user) {
      return res.status(200).json({
        ok: true,
        message: "Si la cuenta existe, se enviará un nuevo enlace.",
      });
    }

    // Usuario ya confirmado → no reenviar
    if (user.emailConfirmed) {
      return res.status(200).json({
        ok: false,
        code: "EMAIL_ALREADY_CONFIRMED",
        message: "Este correo ya está confirmado.",
      });
    }

    // Generar nuevo token
    const newToken = TokenService.generateToken(32);
    const expires = TokenService.expiresIn(EMAIL_CONFIRM_EXPIRES_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmToken: newToken,
        emailConfirmExpires: expires,
      },
    });

    const confirmUrl = `${process.env.WEB_URL}/auth/confirm?token=${newToken}`;

    await EmailService.sendConfirmEmail({
      to: user.email,
      name: user.name,
      confirmUrl,
    });

    return res.status(200).json({
      ok: true,
      message: "Enlace reenviado. Revisa tu correo.",
    });

  } catch (err) {
    console.error("❌ [AUTH resendConfirmation]:", err);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
