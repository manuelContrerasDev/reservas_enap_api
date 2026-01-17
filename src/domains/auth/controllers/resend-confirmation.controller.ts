import { Request, Response } from "express";
import { resendConfirmationService } from "../services/auth.service";
import { mapAuthErrorToHttp } from "../helpers/auth-error.mapper";

export async function resendConfirmationController(req: Request, res: Response) {
  const result = await resendConfirmationService(req.body.email);

  if (!result.ok) {
    return res
      .status(mapAuthErrorToHttp(result.error))
      .json(result);
  }

  return res.json(result);
}
