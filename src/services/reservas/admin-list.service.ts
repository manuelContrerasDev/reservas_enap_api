// src/services/reservas/admin-list.service.ts

import { ReservaEstado, Prisma } from "@prisma/client";
import {
  ReservasAdminRepository,
} from "../../repositories/reservas";

export const ReservasAdminListService = {
  async ejecutar(query: any) {
    let {
      estado,
      espacioId,
      socioId,
      fechaInicio,
      fechaFin,
      page = "1",
      limit = "20",
      sort = "fechaInicio",
      order = "desc",
    } = query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const filtros: Prisma.ReservaWhereInput = {};

    if (estado && estado !== "TODOS") {
      if (!Object.values(ReservaEstado).includes(estado as any))
        throw new Error("ESTADO_INVALIDO");

      filtros.estado = estado as ReservaEstado;
    }

    if (espacioId) filtros.espacioId = espacioId;

    if (socioId) {
      const term = String(socioId);
      filtros.user = {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
        ],
      };
    }

    if (fechaInicio || fechaFin) {
      filtros.fechaInicio = {};
      if (fechaInicio) filtros.fechaInicio.gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaInicio.lte = new Date(fechaFin);
    }

    const orderBy: any = {};
    orderBy[sort] = order === "asc" ? "asc" : "desc";

    const total = await ReservasAdminRepository.contar(filtros);
    const reservas = await ReservasAdminRepository.listar(
      filtros,
      skip,
      limitNum,
      orderBy
    );

    return {
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data: reservas,
    };
  },
};
