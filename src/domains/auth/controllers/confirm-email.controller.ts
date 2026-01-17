import { Request, Response } from "express";
import { confirmEmailService } from "../services/auth.service";
import { mapAuthErrorToHttp } from "../helpers/auth-error.mapper";

export async function confirmEmailController(req: Request, res: Response) {
  const { token } = req.body;

  const result = await confirmEmailService(token);

  if (!result.ok) {
    return res
      .status(mapAuthErrorToHttp(result.error))
      .json(result);
  }

  return res.json(result);
}
