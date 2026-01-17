import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import { reservaBaseInclude } from "./_includes";

type MisReservasPaginadasOpts = {
  page: number;
  limit: number;
  estado?: ReservaEstado;
};

export const ReservasReadRepository = {
  misReservasPaginadas(userId: string, opts: MisReservasPaginadasOpts) {
    const page = Math.max(1, opts.page);
    const limit = Math.max(1, Math.min(opts.limit, 50));
    const skip = (page - 1) * limit;

    return prisma.reserva.findMany({
      where: {
        userId,
        ...(opts.estado ? { estado: opts.estado } : {}),
      },
      orderBy: { fechaInicio: "desc" },
      skip,
      take: limit,
      include: reservaBaseInclude,
    });
  },

  detalle(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      include: {
        ...reservaBaseInclude,
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            descripcion: true,
            capacidad: true,
            imagenUrl: true,
            precioBaseSocio: true,
            precioBaseExterno: true,
            precioPersonaAdicionalSocio: true,
            precioPersonaAdicionalExterno: true,
            precioPiscinaSocio: true,
            precioPiscinaExterno: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
};
