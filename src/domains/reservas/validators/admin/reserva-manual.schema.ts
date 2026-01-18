// ============================================================
// reserva-manual.schema.ts — Reserva Manual Admin (ENAP 2025)
// BACKEND · CONTRATO OFICIAL (FLUJO SIMPLIFICADO)
// ============================================================

import { z } from "zod";
import { UsoReserva } from "@prisma/client";
import { fechaISO } from "../shared/fecha-rango.schema";

/* ============================================================
 * ENUMS (ADMIN)
 * ============================================================ */
export const TipoClienteEnum = z.enum(["SOCIO", "EXTERNO"]);

/* ============================================================
 * INVITADO — INPUT MANUAL (NO DOMINIO FINAL)
 * Usado SOLO en flujo admin wizard
 * ============================================================ */
const invitadoManualInputSchema = z
  .object({
    nombre: z.string().trim().min(2),
    rut: z.string().trim().min(3),
    edad: z.coerce.number().int().min(0).nullable().optional(),
    esPiscina: z.coerce.boolean().optional().default(false),
  })
  .strict();

/* ============================================================
 * SOCIO — INPUT ADMIN
 * ============================================================ */
const socioManualSchema = z
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
 * RESPONSABLE — INPUT ADMIN
 * ============================================================ */
const responsableManualSchema = z
  .object({
    nombre: z.string().trim().min(2),
    rut: z.string().trim().min(3),
    email: z.string().trim().toLowerCase().email(),
    telefono: z.string().trim().min(8),
  })
  .strict();

/* ============================================================
 * RESERVA MANUAL — REQUEST ADMIN
 * ============================================================ */
export const reservaManualRequestSchema = z
  .object({
    /* ================= ESPACIO / FECHAS ================= */
    espacioId: z.string().uuid(),

    fechaInicio: fechaISO,
    fechaFin: fechaISO,

    /* ================= CANTIDADES ================= */
    cantidadAdultos: z.coerce.number().int().min(1),
    cantidadNinos: z.coerce.number().int().min(0),
    cantidadPiscina: z.coerce.number().int().min(0),

    /* ================= USO / CLIENTE ================= */
    usoReserva: z.nativeEnum(UsoReserva),
    tipoCliente: TipoClienteEnum,

    socioPresente: z.coerce.boolean(),

    /* ================= DATOS PERSONA ================= */
    socio: socioManualSchema,
    responsable: responsableManualSchema.nullable().optional(),

    /* ================= INVITADOS (WIZARD) ================= */
    invitados: z.array(invitadoManualInputSchema).optional().default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    /* ================= TERCEROS ================= */
    if (data.usoReserva === "TERCEROS" && data.socioPresente) {
      ctx.addIssue({
        path: ["socioPresente"],
        code: z.ZodIssueCode.custom,
        message:
          "Si el socio va a asistir, la reserva no puede ser para terceros",
      });
    }

    /* ================= RESPONSABLE ================= */
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
 * TYPES — CONTRATO ADMIN
 * ============================================================ */
export type ReservaManualRequest = z.infer<
  typeof reservaManualRequestSchema
>;
