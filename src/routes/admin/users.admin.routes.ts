// src/routes/admin/users.admin.routes.ts
import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Role } from "@prisma/client";
import { prisma } from "../../lib/db";
import z from "zod";

const router = Router();

/**
 * GET /api/admin/users/search?q=texto
 */
router.get(
  "/search",
  authGuard,
  roleGuard([Role.ADMIN]),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      q: z.string().min(1),
    });

    const { q } = schema.parse(req.query);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { rut: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        rut: true,
        name: true,
        email: true,
        role: true,
      },
      take: 10,
    });

    res.json({ ok: true, users });
  })
);

export default router;
