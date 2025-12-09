import "@prisma/client";
import type { AuthUser } from "./global";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
