// src/validators/reservas/invitados.schema.ts
import { z } from "zod";

export const validarInvitados = (data: any, ctx: z.RefinementCtx) => {
  // Invitados opcional
  if (!Array.isArray(data.invitados)) return;

  data.invitados.forEach((i: any, idx: number) => {
    if (!i.nombre || !i.rut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada invitado debe tener nombre y RUT",
        path: ["invitados", idx],
      });
    }

    if (i.edad != null && (isNaN(i.edad) || i.edad < 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Edad inválida en invitado",
        path: ["invitados", idx, "edad"],
      });
    }
  });
};
