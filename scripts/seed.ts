import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@enap.cl"; // cambia a uno real interno
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) throw new Error("Falta ADMIN_SEED_PASSWORD en .env");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return;

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      emailDomain: "enap.cl",
      emailLocked: true,
      passwordHash,
      role: Role.ADMIN,
      emailConfirmed: true, // opcional si confías en seed
    },
  });
}

main()
  .finally(async () => prisma.$disconnect());
