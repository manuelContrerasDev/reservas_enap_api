import { ReservasReadRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";
import { Role } from "@prisma/client";

export const ObtenerReservaService = {
  async ejecutar(reservaId: string, user: AuthUser) {
    if (!user?.id) throw new Error("NO_AUTH");

    // Defensa mínima (el schema ideal va en validateParams)
    if (!reservaId || reservaId.trim().length < 10) {
      throw new Error("INVALID_ID");
    }

    const reserva = await ReservasReadRepository.detalle(reservaId);
    if (!reserva) throw new Error("NOT_FOUND");

    if (user.role !== Role.ADMIN && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    return reserva;
  },
};
