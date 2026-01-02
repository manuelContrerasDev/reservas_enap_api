import { z } from "zod";

/* ===================== SOCIO ===================== */
const socioSchema = z.object({
  nombre: z.string().min(1),
  rut: z.string().min(1),
  telefono: z.string().min(1),
  correoEnap: z.string().email(),
  correoPersonal: z.string().email().nullable().optional(),
});

/* ================= RESPONSABLE =================== */
const responsableSchema = z.object({
  nombre: z.string().min(1),
  rut: z.string().min(1),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
});

/* ================= RESERVA ======================= */
export const reservaManualSchema = z
  .object({
    userId: z.string().uuid(),
    creadaPor: z.string().uuid(),
    espacioId: z.string().uuid(),

    fechaInicio: z.string(),
    fechaFin: z.string(),

    cantidadAdultos: z.number().int().min(1),
    cantidadNinos: z.number().int().min(0),
    cantidadPiscina: z.number().int().min(0),

    usoReserva: z.enum(["USO_PERSONAL", "CARGA_DIRECTA", "TERCEROS"]),
    marcarPagada: z.boolean().optional(),

    socioPresente: z.boolean(),

    socio: socioSchema,
    responsable: responsableSchema.nullable().optional(),
  })
  .transform((data) => ({
    ...data,

    // 🔽 flatten SOCIO
    nombreSocio: data.socio.nombre,
    rutSocio: data.socio.rut,
    telefonoSocio: data.socio.telefono,
    correoEnap: data.socio.correoEnap,
    correoPersonal: data.socio.correoPersonal ?? null,

    // 🔽 flatten RESPONSABLE
    nombreResponsable: data.responsable?.nombre ?? null,
    rutResponsable: data.responsable?.rut ?? null,
    emailResponsable: data.responsable?.email ?? null,
    telefonoResponsable: data.responsable?.telefono ?? null,
  }));

/* ================= TIPOS ========================= */
export type ReservaManualParsed = z.output<typeof reservaManualSchema>;
