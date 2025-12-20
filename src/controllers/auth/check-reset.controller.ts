import { Request, Response } from "express";
import { prisma } from "../../lib/db";

export const checkReset = async (req: Request, res: Response) => {
  try {
    let token = req.query.token as string | undefined;

    // Validación básica
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        code: "INVALID",
        message: "Token requerido",
      });
    }

    token = token.trim();

    // Buscar token en BD
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return res.status(400).json({
        ok: false,
        code: "INVALID",
        message: "Token inválido",
      });
    }

    // Expirado
    if (tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({
        ok: false,
        code: "EXPIRED",
        message: "Token expirado",
      });
    }

    // Ya utilizado
    if (tokenRecord.usedAt) {
      return res.status(400).json({
        ok: false,
        code: "USED",
        message: "Token ya utilizado",
      });
    }

    // Todo OK
    return res.json({
      ok: true,
      code: "VALID",
      message: "Token válido",
    });

  } catch (error) {
    console.error("❌ [AUTH check-reset]:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
