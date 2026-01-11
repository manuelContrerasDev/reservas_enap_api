import { z } from "zod";
import { TipoEspacio } from "@prisma/client";

export const tipoEspacioSchema = z.object({
  tipo: z.nativeEnum(TipoEspacio),
});

export type TipoEspacioParams = z.infer<typeof tipoEspacioSchema>;
