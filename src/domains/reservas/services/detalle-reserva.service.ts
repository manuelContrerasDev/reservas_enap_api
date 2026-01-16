import { ReservasReadRepository } from "../repositories";
import type { AuthUser } from "../../../types/global";
import { Role } from "@prisma/client";

export const DetalleReservaService = {
  async ejecutar(reservaId: string, user: AuthUser) {
    if (!user?.id) {
      throw new Error("NO_AUTH");
    }

    // Defensa mínima (ID ya validado por validateParams)
    if (!reservaId || reservaId.trim().length < 10) {
      throw new Error("INVALID_ID");
    }

    const reserva = await ReservasReadRepository.detalle(reservaId);
    if (!reserva) {
      throw new Error("NOT_FOUND");
    }

    // 🔐 Autorización
    if (user.role !== Role.ADMIN && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    return reserva;
  },
};
