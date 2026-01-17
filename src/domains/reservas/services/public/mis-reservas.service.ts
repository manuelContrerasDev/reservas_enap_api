import { ReservasReadRepository } from "@/domains/reservas/repositories";
import type { AuthUser } from "@/types/global";
import type { MisReservasQuery } from "@/domains/reservas/validators/mis-reservas.schema";

export const MisReservasService = {
  async ejecutar(user: AuthUser, query?: MisReservasQuery) {
    if (!user?.id) throw new Error("NO_AUTH");

    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    return ReservasReadRepository.misReservasPaginadas(user.id, {
      page,
      limit,
      estado: query?.estado,
    });
  },
};
