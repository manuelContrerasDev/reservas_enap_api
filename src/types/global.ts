// 🌐 TIPOS GLOBALES — SISTEMA RESERVAS ENAP

import type { Request } from "express";

export type UserRole = "ADMIN" | "SOCIO" | "EXTERNO";

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole | string;
  name?: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;       // ← requerido por servicios
  sub: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export {};
