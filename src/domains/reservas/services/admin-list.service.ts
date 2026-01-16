import { Prisma } from "@prisma/client";
import { ReservasAdminRepository } from "../repositories";
import type { AdminReservasQuery } from "../validators";

export const ReservasAdminListService = {
  async ejecutar(query: AdminReservasQuery) {

    /* --------------------------------------------------------
     * 1) PAGINACIÓN (HTTP SAFE)
     * -------------------------------------------------------- */
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    /* --------------------------------------------------------
     * 2) FILTROS
     * -------------------------------------------------------- */
    const filtros: Prisma.ReservaWhereInput = {};

    if (query.estado && query.estado !== "TODOS") {
      filtros.estado = query.estado;
    }

    if (query.espacioId) {
      filtros.espacioId = query.espacioId;
    }

    if (query.socio) {
      const term = query.socio.trim();

      filtros.OR = [
        { nombreSocio: { contains: term, mode: "insensitive" } },
        { rutSocio: { contains: term, mode: "insensitive" } },
        { telefonoSocio: { contains: term, mode: "insensitive" } },
        { correoEnap: { contains: term, mode: "insensitive" } },
        { correoPersonal: { contains: term, mode: "insensitive" } },

        { nombreResponsable: { contains: term, mode: "insensitive" } },
        { rutResponsable: { contains: term, mode: "insensitive" } },
        { telefonoResponsable: { contains: term, mode: "insensitive" } },
        { emailResponsable: { contains: term, mode: "insensitive" } },

        { user: { email: { contains: term, mode: "insensitive" } } },
      ];
    }

    if (query.fechaInicio || query.fechaFin) {
      filtros.fechaInicio = {};

      if (query.fechaInicio) {
        const ini = new Date(query.fechaInicio);
        ini.setHours(0, 0, 0, 0);
        filtros.fechaInicio.gte = ini;
      }

      if (query.fechaFin) {
        const fin = new Date(query.fechaFin);
        fin.setHours(23, 59, 59, 999);
        filtros.fechaInicio.lte = fin;
      }
    }

    /* --------------------------------------------------------
     * 3) ORDENAMIENTO
     * -------------------------------------------------------- */
    const sortField: keyof Prisma.ReservaOrderByWithRelationInput =
      query.sort ?? "fechaInicio";

    const order: Prisma.SortOrder = query.order ?? "desc";

    const orderBy: Prisma.ReservaOrderByWithRelationInput = {
      [sortField]: order,
    };

    /* --------------------------------------------------------
     * 4) CONSULTAS
     * -------------------------------------------------------- */
    const total = await ReservasAdminRepository.contar(filtros);

    const data = await ReservasAdminRepository.listar(
      filtros,
      skip,
      limit,
      orderBy
    );

    /* --------------------------------------------------------
     * 5) RESPONSE
     * -------------------------------------------------------- */
    return {
      meta: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      data,
    };
  },
};
