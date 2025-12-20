// ============================================================
// admin.repository.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { prisma } from "../../lib/db";
import { Prisma, ReservaEstado } from "@prisma/client";

export const ReservasAdminRepository = {

  /* ============================================================
   * 📊 COUNT (para paginación)
   * ============================================================ */
  contar(filtros: Prisma.ReservaWhereInput) {
    return prisma.reserva.count({ where: filtros });
  },

  /* ============================================================
   * 📋 LISTADO ADMIN (full data → DTO aplica limpieza)
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
            descripcion: true,
            capacidad: true,
            imagenUrl: true,
            modalidadCobro: true,

            // TARIFAS Y SNAPSHOTS si admin quiere verlas
            precioBaseSocio: true,
            precioBaseExterno: true,
            precioPersonaSocio: true,
            precioPersonaExterno: true,
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
          },
        },

        pago: true,
      },
    });
  },

  /* ============================================================
   * 🔄 ACTUALIZAR ESTADO RESERVA (y devolver full detalle)
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
            descripcion: true,
            capacidad: true,
            imagenUrl: true,
            modalidadCobro: true,

            precioBaseSocio: true,
            precioBaseExterno: true,
            precioPersonaSocio: true,
            precioPersonaExterno: true,
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
          },
        },

        pago: true,
      },
    });
  },

};
