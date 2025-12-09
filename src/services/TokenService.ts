import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_EXPIRES = "7d";

export const TokenService = {
  /**
   * 🔑 Firmar JWT
   */
  sign(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: JWT_EXPIRES,
    });
  },

  /**
   * 🔐 Token aleatorio seguro (genérico)
   */
  generateToken(bytes: number = 32) {
    return crypto.randomBytes(bytes).toString("hex");
  },

  /**
   * 🆕 Alias para evitar errores en controladores nuevos
   */
  randomToken(bytes: number = 32) {
    return this.generateToken(bytes);
  },

  /**
   * ⏱ Calcula fecha de expiración para un token
   */
  expiresIn(ms: number) {
    return new Date(Date.now() + ms);
  },
};
