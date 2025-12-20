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
 * Schema base de reserva (Step 1)
 *  - SOLO estructura y tipos
 *  - Reglas de negocio fuertes se hacen en services/helpers
 * ============================================================ */
export const baseReservaSchema = z.object({
  /* ID espacio */
  espacioId: z.string().uuid("ID de espacio inválido"),

  /* Fechas ISO (validación de negocio se hace en servicios/helpers) */
  fechaInicio: z.string().datetime({ message: "Fecha inicio inválida" }),
  fechaFin: z.string().datetime({ message: "Fecha fin inválida" }),

  /* Datos del socio */
  nombreSocio: textRequired("Nombre requerido"),
  rutSocio: rutSchema,
  telefonoSocio: telSchema,
  correoEnap: emailSchema,
  correoPersonal: emailSchema.optional().nullable(),

  /* Uso de reserva */
  usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]),
  socioPresente: z.boolean(),

  /* Responsable (llenado según reglas de negocio) */
  nombreResponsable: z.string().nullable().optional(),
  rutResponsable: z.string().nullable().optional(),
  emailResponsable: emailSchema.nullable().optional(),
  telefonoResponsable: telSchema.nullable().optional(),

  /* Invitados */
  invitados: z
    .array(
      z.object({
        nombre: textRequired(),
        rut: textRequired(),
        edad: z.number().int().min(0).nullable().optional(),
        esPiscina: z.boolean().optional().default(false),
      })
    )
    .default([]),

  /* Piscina directo (dato de front para cálculo) */
  cantidadPersonasPiscina: z.number().int().min(0).default(0),

  /* Términos */
  terminosAceptados: z.boolean().refine(v => v === true, {
    message: "Debes aceptar los términos",
  }),
  terminosVersion: z.string().nullable().optional(),
});

export type BaseReservaType = z.infer<typeof baseReservaSchema>;
