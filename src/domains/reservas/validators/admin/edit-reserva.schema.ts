import { z } from "zod";
import { validarResponsable } from "../responsable.schema";
import { rutSchema } from "../shared/rut.schema";

/* ============================================================
 * Helpers
 * ============================================================ */
const emailSchema = z
  .string()
  .trim()
  .email("Correo inválido")
  .transform(v => v.toLowerCase());

const textOptional = z.string().trim().min(3).optional();
const telOptional = z.string().trim().min(8, "Teléfono inválido").optional();

/* ============================================================
 * Editar reserva — CONTRATO ADMINISTRATIVO
 * ============================================================ */
export const editReservaSchema = z
  .object({
    /* ================= SOCIO ================= */
    nombreSocio: textOptional,
    rutSocio: rutSchema.optional(),
    telefonoSocio: telOptional,

    correoEnap: emailSchema.nullable().optional(),
    correoPersonal: emailSchema.nullable().optional(),

    /* ================= REGLA ================= */
    socioPresente: z.boolean().optional(),

    /* ================= RESPONSABLE ================= */
    nombreResponsable: textOptional.nullable().optional(),
    rutResponsable: rutSchema.nullable().optional(),
    emailResponsable: emailSchema.nullable().optional(),
    telefonoResponsable: telOptional.nullable().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    validarResponsable(data, ctx);
  });

export type EditReservaType = z.infer<typeof editReservaSchema>;
