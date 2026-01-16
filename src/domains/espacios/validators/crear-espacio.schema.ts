import { z } from "zod";
import { TipoEspacio, ModalidadCobro } from "@prisma/client";

export const crearEspacioSchema = z.object({
  nombre: z.string().min(3).max(100).trim(),
  tipo: z.nativeEnum(TipoEspacio),

  capacidad: z.coerce.number().int().min(1),

  descripcion: z.string().trim().nullable().optional(),
  imagenUrl: z.string().url().trim().nullable().optional(),

  // Estado / visibilidad / orden
  activo: z.coerce.boolean().optional(),
  visible: z.coerce.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),

  modalidadCobro: z.nativeEnum(ModalidadCobro).optional(),

  // Tarifas (modelo final)
  precioBaseSocio: z.coerce.number().int().min(0).optional(),
  precioBaseExterno: z.coerce.number().int().min(0).optional(),

  precioPersonaAdicionalSocio: z.coerce.number().int().min(0).optional(),
  precioPersonaAdicionalExterno: z.coerce.number().int().min(0).optional(),

  precioPiscinaSocio: z.coerce.number().int().min(0).optional(),
  precioPiscinaExterno: z.coerce.number().int().min(0).optional(),
});

export type CrearEspacioDTO = z.infer<typeof crearEspacioSchema>;
