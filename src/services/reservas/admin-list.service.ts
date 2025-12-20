// ============================================================
// admin-list.service.ts — ENAP 2025 (VERSIÓN OFICIAL SINCRONIZADA)
// ============================================================

import { ReservaEstado, Prisma } from "@prisma/client";
import { ReservasAdminRepository } from "../../repositories/reservas";

export const ReservasAdminListService = {
  async ejecutar(query: any) {
    /* --------------------------------------------------------
     * 1) NORMALIZAR QUERY PARAMS
     * -------------------------------------------------------- */
    let {
      estado,
      espacioId,
      socio, // búsqueda libre: nombre / rut / email / responsable / teléfono
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

    /* --------------------------------------------------------
     * 2) CONSTRUIR FILTROS (WhereInput)
     * -------------------------------------------------------- */
    const filtros: Prisma.ReservaWhereInput = {};

    // Estado
    if (estado && estado !== "TODOS") {
      if (!Object.values(ReservaEstado).includes(estado as ReservaEstado)) {
        throw new Error("ESTADO_INVALIDO");
      }
      filtros.estado = estado as ReservaEstado;
    }

    // Espacio
    if (espacioId) filtros.espacioId = String(espacioId);

    // Búsqueda libre por socio / responsable / email / teléfono
    if (socio) {
      const term = String(socio).trim();

      filtros.OR = [
        { nombreSocio: { contains: term, mode: "insensitive" } },
        { rutSocio: { contains: term, mode: "insensitive" } },
        { telefonoSocio: { contains: term, mode: "insensitive" } },
        { correoEnap: { contains: term, mode: "insensitive" } },
        { correoPersonal: { contains: term, mode: "insensitive" } },

        // responsable
        { nombreResponsable: { contains: term, mode: "insensitive" } },
        { rutResponsable: { contains: term, mode: "insensitive" } },
        { telefonoResponsable: { contains: term, mode: "insensitive" } },
        { emailResponsable: { contains: term, mode: "insensitive" } },

        // usuario propietario
        { user: { email: { contains: term, mode: "insensitive" } } },
      ];
    }

    // Filtro por fechas
    if (fechaInicio || fechaFin) {
      filtros.fechaInicio = {};
      if (fechaInicio) filtros.fechaInicio.gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaInicio.lte = new Date(fechaFin);
    }

    /* --------------------------------------------------------
     * 3) ORDENAMIENTO
     * -------------------------------------------------------- */
    const validSorts = [
      "fechaInicio",
      "fechaFin",
      "estado",
      "totalClp",
      "nombreSocio",
    ];

    if (!validSorts.includes(sort)) sort = "fechaInicio";

    const orderBy = { [sort]: order === "asc" ? "asc" : "desc" };

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
        pages: Math.ceil(total / limitNum) || 1,
      },
      data: reservas,
    };
  },
};
