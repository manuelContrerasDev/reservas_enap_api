// src/validators/reservas/base-reserva.schema.ts
import { z } from "zod";

export const baseReservaSchema = z.object({
  espacioId: z.string().uuid("ID de espacio inválido"),

  fechaInicio: z.string().min(5, "Fecha de inicio requerida"),
  fechaFin: z.string().min(5, "Fecha de fin requerida"),

  /* -------- DATOS SOCIO -------- */
  nombreSocio: z.string().min(3, "Nombre del socio inválido"),
  rutSocio: z.string().min(5, "RUT del socio inválido"),
  telefonoSocio: z.string().min(5, "Teléfono inválido"),
  correoEnap: z.string().email("Correo ENAP inválido"),
  correoPersonal: z.string().email("Correo personal inválido").optional(),

  /* -------- USO RESERVA -------- */
  usoReserva: z.enum(
    ["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"],
    { message: "Uso de reserva inválido" }
  ),

  socioPresente: z.boolean(),

  /* -------- RESPONSABLE -------- */
  nombreResponsable: z.string().optional(),
  rutResponsable: z.string().optional(),
  emailResponsable: z.string().email().optional(),

  /* -------- CANTIDADES -------- */
  cantidadPersonas: z
    .any()
    .refine((v) => typeof v === "number", {
      message: "La cantidad de personas debe ser un número",
    })
    .refine((v) => Number.isInteger(v), {
      message: "Debe ser un número entero",
    })
    .refine((v) => v > 0, {
      message: "Debe ser mayor a 0",
    }),

  cantidadPersonasPiscina: z
    .any()
    .refine((v) => typeof v === "number", {
      message: "Debe ser un número",
    })
    .refine((v) => Number.isInteger(v), {
      message: "Debe ser un número entero",
    })
    .refine((v) => v >= 0, {
      message: "Debe ser 0 o mayor",
    })
    .default(0),

  /* -------- TÉRMINOS -------- */
  terminosAceptados: z
    .boolean()
    .refine((v) => v === true, {
      message: "Debes aceptar los términos para continuar",
    }),

  terminosVersion: z.string().optional(),

  /* -------- INVITADOS -------- */
  invitados: z
    .array(
      z.object({
        nombre: z.string().min(2, "Nombre de invitado inválido"),
        rut: z.string().min(5, "RUT de invitado inválido"),
        edad: z
          .any()
          .refine(
            (v) => typeof v === "number" || v === undefined,
            { message: "Edad inválida" }
          )
          .optional(),
      })
    )
    .optional(),
});
