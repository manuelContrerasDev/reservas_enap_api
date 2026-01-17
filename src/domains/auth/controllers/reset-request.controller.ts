import { Request, Response } from "express";
import { resetRequestService } from "../services/auth.service";

export async function resetRequestController(req: Request, res: Response) {
  const result = await resetRequestService(req.body.email);

  // ⚠️ SIEMPRE respuesta neutra
  return res.json(result);
}
