import {prisma} from "../src/config/db";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("Admin1234", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@enap.cl",
      passwordHash,
      name: "Administrador ENAP",
      role: "ADMIN",
      emailConfirmed: true
    },
  });

  console.log("ADMIN creado correctamente:");
  console.log(admin);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
