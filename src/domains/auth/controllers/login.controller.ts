import { Request, Response } from "express";
import { loginService } from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
  const result = await loginService(req.body);

  if (!result.ok) {
    return res
      .status(result.code === "EMAIL_NOT_CONFIRMED" ? 403 : 401)
      .json(result);
  }

  return res.json(result);
};
