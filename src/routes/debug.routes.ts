import { Router } from "express";
import {prisma} from "../config/db";
import bcrypt from "bcryptjs";
const router = Router();


/**
 * SEED ADMIN MANUAL
 * POST /api/debug/seed-admin
 */
router.post("/seed-admin", async (req, res) => {
  console.log("🟦 Entró a /api/debug/seed-admin");
  try {
    const exists = await prisma.user.findUnique({
      where: { email: "admin@enap.cl" },
    });

    if (exists) {
      return res.json({ ok: true, msg: "Admin ya existe" });
    }

    const passwordHash = await bcrypt.hash("Admin123!", 10);

    const admin = await prisma.user.create({
      data: {
        email: "admin@enap.cl",
        passwordHash,
        name: "Administrador ENAP",
        role: "ADMIN",
      },
    });

    return res.json({ ok: true, admin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error creando admin" });
  }
});

export default router;
