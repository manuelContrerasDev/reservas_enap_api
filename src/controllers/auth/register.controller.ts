import { Request, Response } from "express";
import { prisma } from "../../config/db";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { Role } from "@prisma/client";

import { registerSchema } from "../../validators/auth.schema";
import { EmailService } from "../../services/EmailService";
import { TokenService } from "../../services/TokenService";

const EMAIL_CONFIRM_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24 horas

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const targetRole: Role = (data.role as Role | undefined) ?? Role.SOCIO;

    // -------------------------------
    // 1) Verificar si existe el usuario
    // -------------------------------
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      return res.status(400).json({
        ok: false,
        message: "Este correo ya está registrado",
      });
    }

    // -------------------------------
    // 2) Crear usuario
    // -------------------------------
    const passwordHash = await bcrypt.hash(data.password, 12);

    const emailConfirmToken = TokenService.randomToken(32);
    const emailConfirmExpires = TokenService.expiresIn(
      EMAIL_CONFIRM_EXPIRES_MS
    );

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name ?? null,
        role: targetRole,
        emailConfirmed: false,
        emailConfirmToken,
        emailConfirmExpires,
      },
    });

    // -------------------------------
    // 3) Enviar correo de confirmación
    // -------------------------------
    const confirmUrl = `${process.env.WEB_URL}/auth/confirm?token=${emailConfirmToken}`;

    EmailService.sendConfirmEmail({
      to: user.email,
      name: user.name,
      confirmUrl,
    }).catch((err) => console.error("❌ Error enviando correo:", err));

    // -------------------------------
    // 4) Respuesta exitosa
    // -------------------------------
    return res.status(201).json({
      ok: true,
      message: "Usuario registrado. Revisa tu correo para confirmar la cuenta.",
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos",
        issues: error.issues,
      });
    }

    console.error("❌ [AUTH register]:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
