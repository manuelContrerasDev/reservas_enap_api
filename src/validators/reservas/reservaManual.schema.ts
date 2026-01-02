import { z } from "zod";

/* ===================== SOCIO ===================== */
export const socioSchema = z.object({
  nombre: z.string().min(1),
  rut: z.string().min(1),
  telefono: z.string().min(1),
  correoEnap: z.string().email(),
  correoPersonal: z.string().email().nullable().optional(),
});

/* ================= RESPONSABLE =================== */
export const responsableSchema = z.object({
  nombre: z.string().min(1),
  rut: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().min(1),
});

/* ================= RESERVA (REQUEST) ============= */
export const reservaManualRequestSchema = z
  .object({
    userId: z.string().uuid(),
    creadaPor: z.string().uuid(),
    espacioId: z.string().uuid(),

    fechaInicio: z.string(),
    fechaFin: z.string(),

    cantidadAdultos: z.coerce.number().int().min(1),
    cantidadNinos: z.coerce.number().int().min(0),
    cantidadPiscina: z.coerce.number().int().min(0),

    usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]),
    marcarPagada: z.boolean().optional(),

    socioPresente: z.boolean(),

    socio: socioSchema,
    responsable: responsableSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.socioPresente && !data.responsable) {
      ctx.addIssue({
        path: ["responsable"],
        code: z.ZodIssueCode.custom,
        message: "Responsable obligatorio cuando el socio no está presente",
      });
    }

    if (data.socioPresente && data.responsable) {
      ctx.addIssue({
        path: ["responsable"],
        code: z.ZodIssueCode.custom,
        message: "No debe haber responsable si el socio está presente",
      });
    }
  });

/* ================= TIPOS ========================= */
export type ReservaManualRequest = z.infer<
  typeof reservaManualRequestSchema
>;
