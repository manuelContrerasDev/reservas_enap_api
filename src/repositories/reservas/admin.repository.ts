// src/repositories/reservas/admin.repository.ts

import { prisma } from "../../config/db";
import { Prisma, ReservaEstado } from "@prisma/client";

export const ReservasAdminRepository = {

  /* ============================================================
   * 📊 COUNT (para paginación)
   * ============================================================ */
  contar(filtros: Prisma.ReservaWhereInput) {
    return prisma.reserva.count({ where: filtros });
  },

  /* ============================================================
   * 📋 LISTADO ADMIN (con filtros + paginación)
   * ============================================================ */
  listar(
    filtros: Prisma.ReservaWhereInput,
    skip: number,
    take: number,
    orderBy: any
  ) {
    return prisma.reserva.findMany({
      where: filtros,
      skip,
      take,
      orderBy,

      include: {
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invitados: {
          select: {
            id: true,
            nombre: true,
            rut: true,
            edad: true,
          },
        },
        pago: true, // 🔥 agregamos pago para coherencia con read.repository
      },
    });
  },

  /* ============================================================
   * 🔄 ACTUALIZAR ESTADO RESERVA
   * ============================================================ */
  actualizarEstado(id: string, estado: ReservaEstado) {
    return prisma.reserva.update({
      where: { id },
      data: { estado },

      include: {
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invitados: {
          select: {
            id: true,
            nombre: true,
            rut: true,
            edad: true,
          },
        },
        pago: true,
      },
    });
  },

};
