import type { Request } from "express";
import type { Role } from "@prisma/client";

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role | string; // tolera tokens antiguos, pero authGuard normaliza
  name?: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  sub: string;
  email: string;
  role: Role; // ✅ Prisma enum
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export {};
