import { Request, Response } from "express";
import { prisma } from "../../lib/db";
import { resetPasswordSchema } from "../../validators/auth.schema";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    // 1) Buscar token en la BD
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return res.status(400).json({
        ok: false,
        code: "INVALID",
        message: "Token inválido o ya utilizado.",
      });
    }

    // 2) Token expirado
    if (tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({
        ok: false,
        code: "EXPIRED",
        message: "El enlace ha expirado.",
      });
    }

    // 3) Token ya utilizado
    if (tokenRecord.usedAt) {
      return res.status(400).json({
        ok: false,
        code: "USED",
        message: "El token ya fue utilizado.",
      });
    }

    // 4) Actualizar contraseña del usuario
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    // 5) Marcar token actual como usado
    await prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    // 6) INVALIDAR todos los tokens anteriores del usuario
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: tokenRecord.userId,
        usedAt: null,
        NOT: { token },
      },
    });

    // 7) Respuesta OK
    return res.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
    });

  } catch (error) {
    if (error instanceof ZodError)
      return res.status(400).json({
        ok: false,
        code: "INVALID_DATA",
        message: "Datos inválidos",
        issues: error.issues,
      });

    console.error("❌ [AUTH reset-password]:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
