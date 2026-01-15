// src/controllers/reservas/admin/search-users.controller.ts

import { prisma } from "../../../lib/db";
import type { Response } from "express";
import type { AuthRequest } from "@/types/global";

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    // 🔐 Seguridad
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "NO_AUTORIZADO_ADMIN" });
    }

    const q = (req.query.q as string)?.trim();

    if (!q || q.length < 2) {
      return res.json([]); // evita queries inútiles
    }

    const socios = await prisma.user.findMany({
      where: {
        role: "SOCIO",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { rut: { contains: q, mode: "insensitive" } }, // preparado
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        rut: true,
      },
      take: 10,
      orderBy: {
        name: "asc",
      },
    });

    return res.json(socios);
  } catch (error) {
    console.error("❌ Error buscando usuarios (ADMIN):", error);
    return res
      .status(500)
      .json({ error: "ERROR_BUSCANDO_USUARIOS" });
  }
};
