// src/validators/reservas/invitados.schema.ts
import { z } from "zod";

export const validarInvitados = (data: any, ctx: z.RefinementCtx) => {
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
        message: "Edad inválida",
        path: ["invitados", idx, "edad"],
      });
    }

    if (i.esPiscina != null && typeof i.esPiscina !== "boolean") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "esPiscina debe ser booleano",
        path: ["invitados", idx, "esPiscina"],
      });
    }
  });
};
