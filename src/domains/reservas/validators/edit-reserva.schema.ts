import { z } from "zod";
import { validarResponsable } from "./responsable.schema";

/* ============================================================
 * Helpers normalizados
 * ============================================================ */
const emailSchema = z
  .string()
  .trim()
  .email("Correo inválido")
  .transform((v) => v.toLowerCase());

const textOptional = z.string().trim().min(3).optional();
const rutOptional = z.string().trim().min(3, "RUT inválido").optional();
const telOptional = z.string().trim().min(8, "Teléfono inválido").optional();

/* ============================================================
 * Editar reserva — CONTRATO ADMINISTRATIVO
 *
 * ❌ NO permite:
 *  - fechas
 *  - montos
 *  - estado
 *  - invitados
 *
 * ✅ SOLO:
 *  - datos de contacto
 *  - responsable
 * ============================================================ */
export const editReservaSchema = z
  .object({
    /* ================= SOCIO ================= */
    nombreSocio: textOptional,
    rutSocio: rutOptional,
    telefonoSocio: telOptional,

    correoEnap: emailSchema.optional(),
    correoPersonal: emailSchema.nullable().optional(),

    /* ================= REGLA ================= */
    // ⚠️ Solo para reglas de negocio (NO persistente)
    socioPresente: z.boolean().optional(),

    /* ================= RESPONSABLE ================= */
    nombreResponsable: textOptional.nullable().optional(),
    rutResponsable: rutOptional.nullable().optional(),
    emailResponsable: emailSchema.nullable().optional(),
    telefonoResponsable: telOptional.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    /**
     * 🔐 Regla ENAP:
     * - Si socioPresente === false → responsable OBLIGATORIO
     * - Si socioPresente === true  → responsable DEBE venir vacío
     */
    validarResponsable(data, ctx);
  });

export type EditReservaType = z.infer<typeof editReservaSchema>;
