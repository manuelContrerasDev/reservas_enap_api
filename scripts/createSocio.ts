import {prisma} from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("Socio1234", 12);

  const socio = await prisma.user.create({
    data: {
      email: "socio@enap.cl",
      passwordHash,
      name: "Socio de Prueba",
      role: "SOCIO",
      emailConfirmed: true,
    },
  });

  console.log("SOCIO creado:", socio);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
