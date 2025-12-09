// src/validators/espacio.schema.ts

import { z } from "zod";
import { TipoEspacio, ModalidadCobro } from "@prisma/client";

/* ============================================================
 * PARAMS
 * ============================================================ */
export const espacioIdParamSchema = z.object({
  id: z.string().uuid("ID debe ser UUID válido"),
});

/* ============================================================
 * QUERY CATÁLOGO
 * ============================================================ */
export const espacioQuerySchema = z
  .object({
    tipo: z.nativeEnum(TipoEspacio).optional(),

    search: z.string().optional(),

    order: z.enum(["asc", "desc"]).optional(),

    capacidadMin: z
      .string()
      .transform((v) => (v ? Number(v) : undefined))
      .optional(),

    capacidadMax: z
      .string()
      .transform((v) => (v ? Number(v) : undefined))
      .optional(),
  })
  .passthrough();

/* ============================================================
 * CREAR
 * ============================================================ */
export const crearEspacioSchema = z.object({
  nombre: z.string().min(3, "Nombre demasiado corto"),

  tipo: z.nativeEnum(TipoEspacio),

  capacidad: z.coerce.number().int().positive(),

  capacidadExtra: z.coerce.number().int().min(0).nullable().optional(),

  tarifaClp: z.coerce.number().int().positive(),

  tarifaExterno: z.coerce.number().int().positive().nullable().optional(),

  extraSocioPorPersona: z.coerce.number().int().min(0).nullable().optional(),

  extraTerceroPorPersona: z.coerce.number().int().min(0).nullable().optional(),

  descripcion: z.string().nullable().optional(),

  imagenUrl: z.string().url().nullable().optional(),

  modalidadCobro: z.nativeEnum(ModalidadCobro),

  activo: z.coerce.boolean().optional(),
});

export const editarEspacioSchema = crearEspacioSchema.partial();

export type CrearEspacioType = z.infer<typeof crearEspacioSchema>;
export type EditarEspacioType = z.infer<typeof editarEspacioSchema>;
