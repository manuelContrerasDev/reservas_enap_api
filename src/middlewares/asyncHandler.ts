// src/middlewares/asyncHandler.ts
import { Request, Response, NextFunction } from "express";

/**
 * Tipo base para cualquier controlador async.
 */
type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * ============================================================
 * 🧩 asyncHandler
 * ------------------------------------------------------------
 * Wrapper que captura errores de funciones async y los envía
 * automáticamente al errorHandler global sin usar try/catch
 * repetidamente en cada controlador.
 * 
 * Esto mantiene tus controllers limpios y profesionales.
 * ============================================================
 */
export const asyncHandler =
  (controller: AsyncController) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
