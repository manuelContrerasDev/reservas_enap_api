import { Role } from "@prisma/client";

export const mapUserRoleToPrismaRole = (role: string): Role => {
  if (role === "ADMIN") return Role.ADMIN;
  if (role === "SOCIO") return Role.SOCIO;
  if (role === "EXTERNO") return Role.EXTERNO;
  throw new Error("ROL_INVALIDO");
};
