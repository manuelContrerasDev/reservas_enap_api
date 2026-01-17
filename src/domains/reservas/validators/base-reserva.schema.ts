import { z } from "zod";

/* ============================================================
 * Helpers
 * ============================================================ */

// ------------------------
// Email
// ------------------------
const emailSchema = z
  .string()
  .email("Correo inválido")
  .transform(v => v.trim().toLowerCase());

// ------------------------
// Texto requerido
// ------------------------
const textRequired = (msg = "Campo requerido") =>
  z.string().trim().min(1, msg);

// ------------------------
// Teléfono
// ------------------------
const telSchema = z.string().trim().min(8, "Teléfono inválido");

// ------------------------
// RUT (Chile) — validación real
// ------------------------
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
 * Schema base de reserva (Contrato Frontend → Backend)
 * ============================================================ */
export const baseReservaSchema = z
  .object({
    espacioId: z.string().uuid("ID de espacio inválido"),

    fechaInicio: z.string().datetime({ message: "Fecha inicio inválida" }),
    fechaFin: z.string().datetime({ message: "Fecha fin inválida" }),

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

    invitados: z
      .array(
        z.object({
          nombre: textRequired().transform(v => v.trim()),
          rut: rutSchema,
          edad: z.number().int().min(0).nullable().optional(),
          esPiscina: z.boolean().optional().default(false),
        })
      )
      .default([]),

    terminosAceptados: z.boolean().refine(v => v === true, {
      message: "Debes aceptar los términos",
    }),

    terminosVersion: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    /* --------------------------------------------------------
     * Correo ENAP vs EXTERNO
     * -------------------------------------------------------- */
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

    /* --------------------------------------------------------
     * Responsable obligatorio si socio NO está presente
     * -------------------------------------------------------- */
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
