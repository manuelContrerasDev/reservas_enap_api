import { Router } from "express";
import { EmailService } from "../services/EmailService";

const router = Router();

router.get("/test-email", async (req, res) => {
  try {
    await EmailService.sendConfirmEmail({
      to: "manuel.contrerasdev@gmail.com", // cámbialo
      name: "Manuel",
      confirmUrl: "https://google.com"
    });

    return res.json({
      ok: true,
      message: "Email de prueba enviado correctamente!"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
