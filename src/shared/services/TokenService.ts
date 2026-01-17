// src/shared/services/TokenService.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@/config/env";

const JWT_EXPIRES = "7d";
const JWT_ALGORITHM: jwt.Algorithm = "HS256";

/* ============================================================
 * TYPES
 * ============================================================ */
export interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  name?: string | null;
}

/* ============================================================
 * TOKEN SERVICE
 * ============================================================ */
export const TokenService = {
  /**
   * 🔑 Firmar JWT
   */
  sign(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
      algorithm: JWT_ALGORITHM,
    });
  },

  /**
   * 🔐 Token aleatorio seguro (crypto)
   */
  generateToken(bytes: number = 32) {
    return crypto.randomBytes(bytes).toString("hex");
  },

  /**
   * 🆕 Alias semántico
   */
  randomToken(bytes: number = 32) {
    return this.generateToken(bytes);
  },

  /**
   * ⏱ Fecha de expiración
   */
  expiresIn(ms: number) {
    return new Date(Date.now() + ms);
  },
};
