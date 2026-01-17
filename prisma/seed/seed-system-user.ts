// prisma/seed-system-user.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const SYSTEM_ID = "00000000-0000-0000-0000-000000000001";

  const exists = await prisma.user.findUnique({
    where: { id: SYSTEM_ID },
  });

  if (exists) {
    console.log("✅ SYSTEM_MANUAL_USER ya existe");
    return;
  }

  await prisma.user.create({
    data: {
      id: SYSTEM_ID,
      email: "system@enap.local",
      emailDomain: "enap.local",
      emailLocked: true,
      emailConfirmed: true,
      passwordHash:
        "$2b$12$Bdu6GJHz7mEje0mbcvIuBumT8FJ82aPK5OdEFw1.mfQfiUE4duqjW",
      name: "SYSTEM",
      role: "EXTERNO",
    },
  });

  console.log("✅ SYSTEM_MANUAL_USER creado correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error creando SYSTEM_MANUAL_USER", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
