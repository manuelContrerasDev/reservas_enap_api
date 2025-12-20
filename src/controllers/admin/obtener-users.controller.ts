import { prisma } from "../../lib/db";
import { Request, Response } from "express";


export const searchUsers = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string)?.trim() ?? "";

    if (!q) {
      return res.json([]);
    }

    // SOCIOS solamente
    const socios = await prisma.user.findMany({
      where: {
        role: "SOCIO",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          // Si el rut lo guardas dentro de otra tabla o campo, me avisas.
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authorizationsReceived: false,
      },
      take: 10,
      orderBy: {
        name: "asc",
      },
    });

    res.json(socios);
  } catch (error) {
    console.error("❌ Error buscando usuarios:", error);
    res.status(500).json({ message: "Error interno al buscar usuarios." });
  }
};
