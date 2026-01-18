import { z } from "zod";
import { invitadosArraySchema } from "./shared";
import { rangoFechasSchema } from "./shared/fecha-rango.schema";

/* ============================================================
 * Helpers
 * ============================================================ */

const emailSchema = z
  .string()
  .email("Correo inválido")
  .transform(v => v.trim().toLowerCase());

const textRequired = (msg = "Campo requerido") =>
  z.string().trim().min(1, msg);

const telSchema = z.string().trim().min(8, "Teléfono inválido");

/* ---------------- RUT ---------------- */

function validarRut(rutRaw: string): boolean {
  const rut = rutRaw.replace(/\./g, "").replace("-", "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalc =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado);

  return dv === dvCalc;
}

const rutSchema = z
  .string()
  .transform(v => v.replace(/\./g, "").replace("-", "").trim().toUpperCase())
  .refine(validarRut, { message: "RUT inválido" });

/* ============================================================
 * Base Reserva — CONTRATO OFICIAL
 * ============================================================ */
export const baseReservaSchema = rangoFechasSchema.extend({
  espacioId: z.string().uuid("ID de espacio inválido"),

  nombreSocio: textRequired("Nombre requerido"),
  rutSocio: rutSchema,
  telefonoSocio: telSchema,

  correoEnap: emailSchema.optional().nullable(),
  correoPersonal: emailSchema.optional().nullable(),

  usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]),
  socioPresente: z.boolean(),

  nombreResponsable: z.string().nullable().optional(),
  rutResponsable: rutSchema.nullable().optional(),
  emailResponsable: emailSchema.nullable().optional(),
  telefonoResponsable: telSchema.nullable().optional(),

  invitados: invitadosArraySchema,

  terminosAceptados: z.boolean().refine(v => v === true, {
    message: "Debes aceptar los términos",
  }),
  terminosVersion: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  /* TERCEROS */
  if (data.usoReserva === "TERCEROS" && data.socioPresente) {
    ctx.addIssue({
      path: ["socioPresente"],
      code: z.ZodIssueCode.custom,
      message:
        "Si el socio va a asistir, la reserva no puede ser para terceros",
    });
  }

  const esExterno = data.usoReserva === "TERCEROS";

  if (!esExterno && !data.correoEnap) {
    ctx.addIssue({
      path: ["correoEnap"],
      message: "Correo ENAP requerido para socios",
      code: z.ZodIssueCode.custom,
    });
  }

  if (esExterno && !data.correoPersonal) {
    ctx.addIssue({
      path: ["correoPersonal"],
      message: "Correo personal requerido para externos",
      code: z.ZodIssueCode.custom,
    });
  }

  if (!data.socioPresente) {
    if (
      !data.nombreResponsable ||
      !data.rutResponsable ||
      !data.emailResponsable ||
      !data.telefonoResponsable
    ) {
      ctx.addIssue({
        path: ["nombreResponsable"],
        message:
          "Debe designar un responsable cuando el socio no está presente",
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

export type BaseReservaType = z.infer<typeof baseReservaSchema>;
