import { Request, Response } from "express";
import { resendConfirmationService } from "../services/auth.service";

export const resendConfirmation = async (req: Request, res: Response) => {
  await resendConfirmationService(req.body.email);

  return res.json({
    ok: true,
    message: "Si la cuenta existe, se enviará un nuevo enlace.",
  });
};
