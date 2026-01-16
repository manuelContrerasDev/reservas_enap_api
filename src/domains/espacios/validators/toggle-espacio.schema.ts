import { z } from "zod";

export const toggleEspacioSchema = z.object({
  id: z.string().uuid(),
});

export type ToggleEspacioDTO = z.infer<typeof toggleEspacioSchema>;
