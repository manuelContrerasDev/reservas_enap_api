import { Response } from "express";
import { prisma } from "../../config/db";
import type { AuthRequest } from "../../types/global";

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "No autenticado",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        emailConfirmed: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({ ok: true, user });
  } catch (error) {
    console.error("❌ [AUTH me]:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
