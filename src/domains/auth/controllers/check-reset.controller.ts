import { Request, Response } from "express";
import { checkResetService } from "../services/auth.service";
import { mapAuthErrorToHttp } from "../helpers/auth-error.mapper";

export async function checkResetController(req: Request, res: Response) {
  const result = await checkResetService(req.body.token);

  if (!result.ok) {
    return res
      .status(mapAuthErrorToHttp(result.error))
      .json(result);
  }

  return res.json(result);
}
