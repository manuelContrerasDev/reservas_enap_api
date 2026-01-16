// ============================================================
// reservaManual.schema.ts — Reserva Manual Admin (ENAP 2025)
// BACKEND · CONTRATO OFICIAL
// ============================================================

import { z } from "zod";
import { UsoReserva } from "@prisma/client";

/* ============================================================
 * ENUMS
 * ============================================================ */
export const TipoClienteEnum = z.enum(["SOCIO", "EXTERNO"]);

/* ============================================================
 * INVITADO
 * ============================================================ */
export const invitadoSchema = z
  .object({
    nombre: z.string().trim().min(2),
    rut: z.string().trim().min(3),
    edad: z.coerce.number().int().min(0).nullable().optional(),
    esPiscina: z.coerce.boolean().optional().default(false),
  })
  .strict();

/* ============================================================
 * SOCIO
 * ============================================================ */
export const socioSchema = z
  .object({
    nombre: z.string().trim().min(2),
    rut: z.string().trim().min(3),
    telefono: z.string().trim().min(8),
    correoEnap: z.string().trim().toLowerCase().email(),
    correoPersonal: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .nullable()
      .optional(),
  })
  .strict();

/* ============================================================
 * RESPONSABLE
 * ============================================================ */
export const responsableSchema = z
  .object({
    nombre: z.string().trim().min(2),
    rut: z.string().trim().min(3),
    email: z.string().trim().toLowerCase().email(),
    telefono: z.string().trim().min(8),
  })
  .strict();

/* ============================================================
 * RESERVA MANUAL (ADMIN)
 * ============================================================ */
export const reservaManualRequestSchema = z
  .object({
    /* ================= FECHAS / ESPACIO ================= */
    espacioId: z.string().uuid(),

    fechaInicio: z.string().trim().min(8),
    fechaFin: z.string().trim().min(8),

    /* ================= CANTIDADES ================= */
    cantidadAdultos: z.coerce.number().int().min(1),
    cantidadNinos: z.coerce.number().int().min(0),
    cantidadPiscina: z.coerce.number().int().min(0),

    /* ================= USO / CLIENTE ================= */
    usoReserva: z.nativeEnum(UsoReserva),
    tipoCliente: TipoClienteEnum,

    socioPresente: z.coerce.boolean(),

    /* ================= DATOS PERSONA ================= */
    socio: socioSchema,
    responsable: responsableSchema.nullable().optional(),

    /* ================= INVITADOS ================= */
    invitados: z.array(invitadoSchema).optional().default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    /* ================= REGLAS RESPONSABLE ================= */
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

    /* ================= COHERENCIA INVITADOS ================= */
    if (
      data.invitados.length >
      data.cantidadAdultos + data.cantidadNinos
    ) {
      ctx.addIssue({
        path: ["invitados"],
        code: z.ZodIssueCode.custom,
        message: "Los invitados superan la cantidad total declarada",
      });
    }
  });

/* ============================================================
 * TYPES
 * ============================================================ */
export type ReservaManualRequest = z.infer<
  typeof reservaManualRequestSchema
>;
