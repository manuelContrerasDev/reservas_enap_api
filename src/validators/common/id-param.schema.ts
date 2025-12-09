// src/validators/common/id-param.schema.ts
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type IdParamType = z.infer<typeof idParamSchema>;
