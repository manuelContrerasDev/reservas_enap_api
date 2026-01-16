// src/validators/reservas/base-reserva.schema.ts
import { z } from "zod";

/* ============================================================
 * Helpers
 * ============================================================ */
const emailSchema = z
  .string()
  .email("Correo inválido")
  .transform(v => v.trim().toLowerCase());

const textRequired = (msg = "Campo requerido") =>
  z.string().trim().min(1, msg);

const rutSchema = z.string().trim().min(3, "RUT inválido");
const telSchema = z.string().trim().min(8, "Teléfono inválido");

/* ============================================================
 * Schema base de reserva (Contrato Frontend → Backend)
 * ============================================================ */
export const baseReservaSchema = z.object({
  espacioId: z.string().uuid("ID de espacio inválido"),

  fechaInicio: z.string().datetime({ message: "Fecha inicio inválida" }),
  fechaFin: z.string().datetime({ message: "Fecha fin inválida" }),

  nombreSocio: textRequired("Nombre requerido"),
  rutSocio: rutSchema,
  telefonoSocio: telSchema,
  correoEnap: emailSchema,
  correoPersonal: emailSchema.optional().nullable(),

  usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]),
  socioPresente: z.boolean(),

  nombreResponsable: z.string().nullable().optional(),
  rutResponsable: z.string().nullable().optional(),
  emailResponsable: emailSchema.nullable().optional(),
  telefonoResponsable: telSchema.nullable().optional(),

  invitados: z.array(
    z.object({
      nombre: textRequired().transform(v => v.trim()),
      rut: textRequired().transform(v => v.trim()),
      edad: z.number().int().min(0).nullable().optional(),
      esPiscina: z.boolean().optional().default(false),
    })
  ).default([]),

  // ✅ FIX REAL
  terminosAceptados: z
    .boolean()
    .refine(v => v === true, {
      message: "Debes aceptar los términos",
    }),

  terminosVersion: z.string().nullable().optional(),
});

export type BaseReservaType = z.infer<typeof baseReservaSchema>;
