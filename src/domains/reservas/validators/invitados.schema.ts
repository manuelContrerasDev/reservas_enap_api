// src/validators/reservas/invitados.schema.ts
import { z } from "zod";

export const validarInvitados = (data: any, ctx: z.RefinementCtx) => {
  if (!data || !Array.isArray(data.invitados)) return;

  data.invitados.forEach((raw: any, idx: number) => {
    const nombre = typeof raw?.nombre === "string" ? raw.nombre.trim() : "";
    const rut = typeof raw?.rut === "string" ? raw.rut.trim() : "";
    const edad = raw?.edad;

    if (!nombre || !rut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada invitado debe tener nombre y RUT",
        path: ["invitados", idx],
      });
    }

    if (edad != null) {
      const n = Number(edad);
      if (Number.isNaN(n) || !Number.isInteger(n) || n < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Edad inválida",
          path: ["invitados", idx, "edad"],
        });
      }
    }

    if (raw?.esPiscina != null && typeof raw.esPiscina !== "boolean") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "esPiscina debe ser booleano",
        path: ["invitados", idx, "esPiscina"],
      });
    }
  });
};
