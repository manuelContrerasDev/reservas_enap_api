import { Request, Response } from "express";
import { loginService } from "../services/auth.service";
import { mapAuthErrorToHttp } from "../helpers/auth-error.mapper";

export async function loginController(req: Request, res: Response) {
  const result = await loginService(req.body);

  if (!result.ok) {
    return res
      .status(mapAuthErrorToHttp(result.error))
      .json(result);
  }

  return res.json(result);
}
