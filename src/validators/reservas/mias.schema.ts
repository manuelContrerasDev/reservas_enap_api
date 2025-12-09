// src/validators/reservas/mias.schema.ts
import { z } from "zod";

// Por ahora, sin filtros. Fácil de ampliar después.
export const reservasMiasQuerySchema = z.object({}).optional();

export type ReservasMiasQueryType = z.infer<typeof reservasMiasQuerySchema>;
