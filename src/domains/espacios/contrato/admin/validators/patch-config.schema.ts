// src/domains/espacios/contrato/admin/validators/patch-config.schema.ts
import { z } from "zod";
import { ModalidadCobro, TipoEspacio } from "@prisma/client";

export const patchEspacioTipoConfigSchema = z.object({
  tipo: z.nativeEnum(TipoEspacio),

  titulo: z.string().min(3).optional(),
  descripcion: z.string().optional(),
  imagenes: z.array(z.string()).optional(),

  visible: z.boolean().optional(),

  unidadesTotales: z.number().int().positive().optional(),
  cupoTotal: z.number().int().positive().optional(),

  modalidadCobro: z.nativeEnum(ModalidadCobro).optional(),

  capacidadSocio: z.number().int().positive().optional(),
  capacidadExterno: z.number().int().positive().optional(),
  capacidadComun: z.number().int().positive().optional(),
  capacidadAlojamiento: z.number().int().positive().optional(),
  maximoAbsoluto: z.number().int().positive().optional(),

  precioBaseSocio: z.number().int().min(0).optional(),
  precioBaseExterno: z.number().int().min(0).optional(),

  precioExtraSocio: z.number().int().min(0).optional(),
  precioExtraExterno: z.number().int().min(0).optional(),

  precioPiscinaSocio: z.number().int().min(0).optional(),
  precioPiscinaExterno: z.number().int().min(0).optional(),

  freePiscinaSocio: z.number().int().min(0).optional(),
});
