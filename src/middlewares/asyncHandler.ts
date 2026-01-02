import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrapper para controllers async.
 * Evita try/catch repetido y enruta errores al errorHandler.
 */
export const asyncHandler =
  <TReq extends Request = Request>(
    controller: (req: TReq, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    void Promise.resolve(controller(req as TReq, res, next)).catch(next);
  };
