import { z } from "zod";
import { UsoReserva } from "@prisma/client";

/* ===================== INVITADO ===================== */
export const invitadoSchema = z.object({
  nombre: z.string().trim().min(2),
  rut: z.string().trim().min(3),
  edad: z.coerce.number().int().min(0).nullable().optional(),
  esPiscina: z.coerce.boolean().optional().default(false),
}).strict();

/* ===================== SOCIO ===================== */
export const socioSchema = z
  .object({
    nombre: z.string().trim().min(2),
    rut: z.string().trim().min(3),
    telefono: z.string().trim().min(8),
    correoEnap: z.string().trim().toLowerCase().email(),
    correoPersonal: z.string().trim().toLowerCase().email().nullable().optional(),
  })
  .strict();

/* ================= RESPONSABLE =================== */
export const responsableSchema = z
  .object({
    nombre: z.string().trim().min(2),
    rut: z.string().trim().min(3),
    email: z.string().trim().toLowerCase().email(),
    telefono: z.string().trim().min(8),
  })
  .strict();

/* ================= RESERVA (REQUEST) ============= */
export const reservaManualRequestSchema = z
  .object({
    userId: z.string().uuid(),
    creadaPor: z.string().uuid(),
    espacioId: z.string().uuid(),

    // Fechas (YYYY-MM-DD recomendado)
    fechaInicio: z.string().trim().min(8),
    fechaFin: z.string().trim().min(8),

    // Cantidades (la reserva manual puede venir con conteo aunque falten datos)
    cantidadAdultos: z.coerce.number().int().min(1),
    cantidadNinos: z.coerce.number().int().min(0),
    cantidadPiscina: z.coerce.number().int().min(0),

    usoReserva: z.nativeEnum(UsoReserva),

    // Admin puede marcar pagada (opcional)
    marcarPagada: z.coerce.boolean().optional().default(false),

    socioPresente: z.coerce.boolean(),

    socio: socioSchema,
    responsable: responsableSchema.nullable().optional(),

    // ✅ opcional: si el admin ya ingresó listado
    invitados: z.array(invitadoSchema).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    // Responsable según socioPresente
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

export type ReservaManualRequest = z.infer<typeof reservaManualRequestSchema>;
