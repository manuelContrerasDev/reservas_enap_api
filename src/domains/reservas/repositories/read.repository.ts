import { prisma } from "../../../lib/db";
import { ReservaEstado } from "@prisma/client";

type MisReservasPaginadasOpts = {
  page: number;
  limit: number;
  estado?: ReservaEstado;
};

export const ReservasReadRepository = {
  /* ============================================================
   * 👤 MIS RESERVAS
   * ============================================================ */
  misReservas(userId: string) {
    return prisma.reserva.findMany({
      where: { userId },
      orderBy: { fechaInicio: "desc" },
      include: {
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            capacidad: true,
            imagenUrl: true,
          },
        },
        invitados: {
          select: {
            id: true,
            nombre: true,
            rut: true,
            edad: true,
            esPiscina: true,
          },
        },
        pago: {
          select: {
            id: true,
            status: true,
            amountClp: true,
            transactionDate: true,
          },
        },
      },
    });
  },

  /* ============================================================
   * 👤 MIS RESERVAS POR ESTADO
   * ============================================================ */
  misReservasPorEstado(userId: string, estado: ReservaEstado) {
    return prisma.reserva.findMany({
      where: { userId, estado },
      orderBy: { fechaInicio: "desc" },
      include: {
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            capacidad: true,
            imagenUrl: true,
          },
        },
        invitados: {
          select: {
            id: true,
            nombre: true,
            rut: true,
            edad: true,
            esPiscina: true,
          },
        },
        pago: {
          select: {
            id: true,
            status: true,
            amountClp: true,
            transactionDate: true,
          },
        },
      },
    });
  },

  /* ============================================================
   * 👤 MIS RESERVAS PAGINADAS
   * ============================================================ */
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
      include: {
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            capacidad: true,
            imagenUrl: true,
          },
        },
        invitados: {
          select: {
            id: true,
            nombre: true,
            rut: true,
            edad: true,
            esPiscina: true,
          },
        },
        pago: {
          select: {
            id: true,
            status: true,
            amountClp: true,
            transactionDate: true,
          },
        },
      },
    });
  },

  /* ============================================================
   * 📄 DETALLE RESERVA (USER / ADMIN)
   * ============================================================ */
  detalle(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      include: {
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
        invitados: {
          select: {
            id: true,
            nombre: true,
            rut: true,
            edad: true,
            esPiscina: true,
          },
        },
        pago: true,
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
