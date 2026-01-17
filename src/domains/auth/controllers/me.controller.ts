import { Response } from "express";
import type { AuthRequest } from "@/types/global";
import { meService } from "../services/auth.service";

export async function meController(req: AuthRequest, res: Response) {
  const result = await meService(req.user!.id);
  return res.json(result);
}
