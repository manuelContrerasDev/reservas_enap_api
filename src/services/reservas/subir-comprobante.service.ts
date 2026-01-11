// src/services/reservas/subir-comprobante.service.ts
import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../types/global";
import type { SubirComprobanteType } from "../../validators/reservas/subir-comprobante.schema";

export const SubirComprobanteService = {
  async ejecutar(reservaId: string, data: SubirComprobanteType, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: {
        id: true,
        userId: true,
        estado: true,
      },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    const estadosBloqueados: ReservaEstado[] = [
      ReservaEstado.CANCELADA,
      ReservaEstado.RECHAZADA,
      ReservaEstado.CADUCADA,
    ];

    if (estadosBloqueados.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_ADMITE_COMPROBANTE");
    }

    return prisma.reserva.update({
      where: { id: reservaId },
      data: {
        comprobanteUrl: data.comprobanteUrl,
        comprobanteName: data.comprobanteName,
        comprobanteMime: data.comprobanteMime,
        comprobanteSize: data.comprobanteSize,
      },
    });
  },
};
