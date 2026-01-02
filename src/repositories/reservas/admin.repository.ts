import { prisma } from "../../lib/db";
import { Prisma, ReservaEstado } from "@prisma/client";

/* ============================================================
 * INCLUDE ADMIN CENTRALIZADO
 * ============================================================ */
const adminInclude = {
  espacio: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      descripcion: true,
      capacidad: true,
      imagenUrl: true,
      modalidadCobro: true,

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
      role: true,
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
} satisfies Prisma.ReservaInclude;

export const ReservasAdminRepository = {
  contar(filtros: Prisma.ReservaWhereInput) {
    return prisma.reserva.count({ where: filtros });
  },

  listar(
    filtros: Prisma.ReservaWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ReservaOrderByWithRelationInput
  ) {
    return prisma.reserva.findMany({
      where: filtros,
      skip,
      take,
      orderBy,
      include: adminInclude,
    });
  },

  obtenerPorId(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      include: adminInclude,
    });
  },

  actualizarEstado(id: string, estado: ReservaEstado) {
    return prisma.reserva.update({
      where: { id },
      data: {
        estado,
        cancelledAt: estado === ReservaEstado.CANCELADA ? new Date() : null,
        cancelledBy: estado === ReservaEstado.CANCELADA ? "ADMIN" : null,
      },
      include: adminInclude,
    });
  },
};
