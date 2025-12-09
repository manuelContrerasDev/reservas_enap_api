import { z } from "zod";

export const espacioIdSchema = z.object({
  id: z.string().uuid(),
});

export type EspacioIdDTO = z.infer<typeof espacioIdSchema>;
