import { z } from "zod";
import { invitadosArraySchema } from "./shared";
import { rangoFechasSchema } from "./shared/fecha-rango.schema";

/* ============================================================
 * Base Reserva Schema (BACKEND)
 * ------------------------------------------------------------
 * CONTRATO 1:1 PARA CREACIÓN DE RESERVAS (STEP 1 FORM)
 *
 * Fuente de verdad:
 * - Prisma model Reserva
 * - Servicio CrearReservaService calcula: dias, cantidades, snapshots, totalClp
 *
 * Reglas clave:
 * - tipoEspacio SIEMPRE es explícito (CABANA | QUINCHO | PISCINA)
 * - espacioId aplica SOLO a CABANA/QUINCHO
 * - Piscina se reserva por tipo (NO por unidad): espacioId debe ser null/undefined
 * - terminosAceptados debe ser true y terminosVersion debe existir
 * ============================================================ */

/* ============================================================
 * Helpers
 * ============================================================ */

const emailSchema = z
  .string()
  .email("Correo inválido")
  .transform((v) => v.trim().toLowerCase());

const textRequired = (msg = "Campo requerido") =>
  z.string().trim().min(1, msg);

const telSchema = z
  .string()
  .trim()
  .min(8, "Teléfono inválido");

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
  .transform((v) => v.replace(/\./g, "").replace("-", "").trim().toUpperCase())
  .refine(validarRut, { message: "RUT inválido" });

/* ============================================================
 * Base Reserva — CONTRATO OFICIAL (1:1)
 * ============================================================ */
export const baseReservaSchema = rangoFechasSchema
  .extend({
    /**
     * ✅ Contrato explícito: el cliente declara el producto reservado.
     * Esto evita ambigüedad (especialmente para PISCINA, que no depende de espacioId).
     */
    tipoEspacio: z.enum(["CABANA", "QUINCHO", "PISCINA"]),

    /**
     * ✅ Unidad (Espacio) solo aplica a CABANA/QUINCHO.
     * Para PISCINA debe ser null/undefined.
     *
     * Prisma: espacioId String? (nullable)
     */
    espacioId: z.string().uuid("ID de espacio inválido").nullable().optional(),

    // -----------------------------
    // Datos del solicitante
    // -----------------------------
    nombreSocio: textRequired("Nombre requerido"),
    rutSocio: rutSchema,
    telefonoSocio: telSchema,

    /**
     * Correos condicionales según usoReserva:
     * - Socio (no terceros): correoEnap requerido
     * - Terceros/external: correoPersonal requerido
     */
    correoEnap: emailSchema.optional().nullable(),
    correoPersonal: emailSchema.optional().nullable(),

    // -----------------------------
    // Uso de reserva
    // -----------------------------
    usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]),

    /**
     * Prisma: socioPresente Boolean @default(true)
     * Si false, responsable es obligatorio.
     */
    socioPresente: z.boolean(),

    // Responsable (solo si socioPresente === false)
    nombreResponsable: z.string().nullable().optional(),
    rutResponsable: rutSchema.nullable().optional(),
    emailResponsable: emailSchema.nullable().optional(),
    telefonoResponsable: telSchema.nullable().optional(),

    // Invitados (incluye flags como esPiscina)
    invitados: invitadosArraySchema,

    /**
     * ✅ Producción: aceptar términos no es “boolean cualquiera”.
     * Debe ser literal true.
     */
    terminosAceptados: z.literal(true, {
      message: "Debes aceptar los términos",
    }),


    /**
     * ✅ Producción / legal: si aceptas términos, debes registrar versión.
     * Evita reservas sin trazabilidad de términos.
     */
    terminosVersion: z.string().trim().min(1, "Versión de términos requerida"),
  })
  .superRefine((data, ctx) => {
    /* ============================================================
     * Reglas de consistencia de producto
     * ============================================================ */

    // CABANA / QUINCHO requieren unidad (espacioId)
    if (data.tipoEspacio !== "PISCINA" && !data.espacioId) {
      ctx.addIssue({
        path: ["espacioId"],
        code: z.ZodIssueCode.custom,
        message: "Debes seleccionar un espacio para este tipo de reserva",
      });
    }

    // PISCINA NO debe traer espacioId (se reserva por tipo)
    if (data.tipoEspacio === "PISCINA" && data.espacioId) {
      ctx.addIssue({
        path: ["espacioId"],
        code: z.ZodIssueCode.custom,
        message: "La reserva de Piscina no debe incluir espacioId",
      });
    }

    /* ============================================================
     * Reglas de uso / presencia
     * ============================================================ */

    // Si el socio va a asistir, no puede ser reserva para terceros
    if (data.usoReserva === "TERCEROS" && data.socioPresente) {
      ctx.addIssue({
        path: ["socioPresente"],
        code: z.ZodIssueCode.custom,
        message:
          "Si el socio va a asistir, la reserva no puede ser para terceros",
      });
    }

    const esTerceros = data.usoReserva === "TERCEROS";

    // Socio -> correo ENAP obligatorio
    if (!esTerceros && !data.correoEnap) {
      ctx.addIssue({
        path: ["correoEnap"],
        message: "Correo ENAP requerido para socios",
        code: z.ZodIssueCode.custom,
      });
    }

    // Terceros -> correo personal obligatorio
    if (esTerceros && !data.correoPersonal) {
      ctx.addIssue({
        path: ["correoPersonal"],
        message: "Correo personal requerido para externos",
        code: z.ZodIssueCode.custom,
      });
    }

    // Si socio NO está presente, responsable obligatorio (todos los campos)
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

    /* ============================================================
     * Reglas mínimas para PISCINA (evitar reservas “vacías”)
     * ============================================================ */

    // Si es piscina y el socio NO va, debe existir al menos 1 invitado
    // (evita totalPersonas = 0 en cálculos y reservas sin asistentes)
    if (
      data.tipoEspacio === "PISCINA" &&
      !data.socioPresente &&
      data.invitados.length === 0
    ) {
      ctx.addIssue({
        path: ["invitados"],
        code: z.ZodIssueCode.custom,
        message: "La reserva de Piscina debe incluir al menos una persona",
      });
    }
  });

export type BaseReservaType = z.infer<typeof baseReservaSchema>;
