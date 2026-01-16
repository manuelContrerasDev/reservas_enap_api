import { z } from "zod";
import { TipoEspacio, ModalidadCobro } from "@prisma/client";

export const actualizarEspacioSchema = z.object({
  nombre: z.string().min(3).max(100).trim().optional(),
  tipo: z.nativeEnum(TipoEspacio).optional(),

  capacidad: z.coerce.number().int().min(1).optional(),

  descripcion: z.string().trim().nullable().optional(),
  imagenUrl: z.string().url().trim().nullable().optional(),

  activo: z.coerce.boolean().optional(),
  visible: z.coerce.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),

  modalidadCobro: z.nativeEnum(ModalidadCobro).optional(),

  precioBaseSocio: z.coerce.number().int().min(0).optional(),
  precioBaseExterno: z.coerce.number().int().min(0).optional(),

  precioPersonaAdicionalSocio: z.coerce.number().int().min(0).optional(),
  precioPersonaAdicionalExterno: z.coerce.number().int().min(0).optional(),

  precioPiscinaSocio: z.coerce.number().int().min(0).optional(),
  precioPiscinaExterno: z.coerce.number().int().min(0).optional(),
});

export type ActualizarEspacioDTO = z.infer<typeof actualizarEspacioSchema>;
