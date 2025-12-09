import { z } from "zod";
import { TipoEspacio, ModalidadCobro } from "@prisma/client";

export const actualizarEspacioSchema = z.object({
  nombre: z.string().min(3).max(100).trim().optional(),
  tipo: z.nativeEnum(TipoEspacio).optional(),

  capacidad: z.number().int().min(1).optional(),
  capacidadExtra: z.number().int().min(1).nullable().optional(),

  tarifaClp: z.number().int().min(0).optional(),
  tarifaExterno: z.number().int().min(0).nullable().optional(),

  extraSocioPorPersona: z.number().int().min(0).nullable().optional(),
  extraTerceroPorPersona: z.number().int().min(0).nullable().optional(),

  descripcion: z.string().trim().nullable().optional(),
  imagenUrl: z.string().url().trim().nullable().optional(),

  modalidadCobro: z.nativeEnum(ModalidadCobro).optional(),
  activo: z.boolean().optional(),
});

export type ActualizarEspacioDTO = z.infer<typeof actualizarEspacioSchema>;
