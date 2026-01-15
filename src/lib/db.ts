// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Evita múltiples instancias en hot-reload (dev)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"], // producción: solo errores
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
