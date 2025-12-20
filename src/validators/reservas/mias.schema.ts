// src/validators/reservas/mias.schema.ts
import { z } from "zod";

export const reservasMiasQuerySchema = z.object({}).optional();

export type ReservasMiasQueryType = z.infer<typeof reservasMiasQuerySchema>;
