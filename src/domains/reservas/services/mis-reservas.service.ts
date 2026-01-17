import { ReservasReadRepository } from "../repositories";
import type { AuthUser } from "../../../types/global";
import type { MisReservasQuery } from "../validators/mis-reservas.schema";

export const ReservasMiasService = {
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
