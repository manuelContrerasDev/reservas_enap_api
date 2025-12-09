// src/services/reservas/mias.service.ts

import { ReservasReadRepository } from "../../repositories/reservas";
import { prisma } from "../../config/db";

export const ReservasMiasService = {
  async ejecutar(user: any) {
    if (!user) throw new Error("NO_AUTH");

    let userId = user.sub;

    // Externo → buscar socio autorizado
    if (user.role === "EXTERNO") {
      const relation = await prisma.guestAuthorization.findFirst({
        where: { invitadoId: user.sub },
      });

      if (!relation) throw new Error("NO_AUTORIZADO_EXTERNOS");

      userId = relation.socioId;
    }

    return ReservasReadRepository.misReservas(userId);
  }
};
