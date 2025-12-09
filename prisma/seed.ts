// prisma/seed.ts
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// CONEXIÓN PG (MISMO ADAPTER QUE BACKEND)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Creando usuarios iniciales...");

  const adminEmail = "admin@enap.cl";
  const socioEmail = "socio@enap.cl";

  const adminPassword = await bcrypt.hash("admin1234", 12);
  const socioPassword = await bcrypt.hash("socio1234", 12);

  // ADMIN
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      role: "ADMIN",
      emailConfirmed: true,
      name: "Administrador ENAP",
    },
  });

  // SOCIO
  await prisma.user.upsert({
    where: { email: socioEmail },
    update: {},
    create: {
      email: socioEmail,
      passwordHash: socioPassword,
      role: "SOCIO",
      emailConfirmed: true,
      name: "Socio de Prueba",
    },
  });

  console.log("✅ Usuarios creados correctamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
