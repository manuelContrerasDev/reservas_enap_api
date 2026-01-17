import { Request, Response } from "express";
import { registerService } from "../services/auth.service";
import { mapAuthErrorToHttp } from "../helpers/auth-error.mapper";

export async function registerController(req: Request, res: Response) {
  const result = await registerService(req.body);

  if (!result.ok) {
    return res
      .status(mapAuthErrorToHttp(result.error))
      .json(result);
  }

  return res.status(201).json(result);
}
