// ============================================================
// admin-list.service.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { ReservaEstado, Prisma } from "@prisma/client";
import { ReservasAdminRepository } from "../../repositories/reservas";
import type { AdminReservasQuery } from "../../validators/reservas";

export const ReservasAdminListService = {
  async ejecutar(query: AdminReservasQuery) {

    /* --------------------------------------------------------
     * 1) NORMALIZAR PAGINACIÓN
     * -------------------------------------------------------- */
    const pageNum = Math.max(1, Number(query.page) || 1);
    const limitNum = Math.max(1, Number(query.limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    /* --------------------------------------------------------
     * 2) CONSTRUIR FILTROS
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
        filtros.fechaInicio.gte = new Date(query.fechaInicio);
      }

      if (query.fechaFin) {
        filtros.fechaInicio.lte = new Date(query.fechaFin);
      }
    }

    /* --------------------------------------------------------
     * 3) ORDENAMIENTO
     * -------------------------------------------------------- */
    const sort = query.sort ?? "fechaInicio";

    const orderBy: Prisma.ReservaOrderByWithRelationInput = {
      [sort]: query.order === "asc" ? "asc" : "desc",
    };

    /* --------------------------------------------------------
     * 4) CONSULTAS
     * -------------------------------------------------------- */
    const total = await ReservasAdminRepository.contar(filtros);

    const reservas = await ReservasAdminRepository.listar(
      filtros,
      skip,
      limitNum,
      orderBy
    );

    /* --------------------------------------------------------
     * 5) RETORNO
     * -------------------------------------------------------- */
    return {
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
      data: reservas,
    };
  },
};
