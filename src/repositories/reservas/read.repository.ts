// src/repositories/reservas/read.repository.ts

import { prisma } from "../../config/db";
import { Prisma, ReservaEstado } from "@prisma/client";

export const ReservasReadRepository = {

  /* ============================================================
   * 📌 MIS RESERVAS (Socio / Externo Autorizado)
   * — Unificado con estructura de adminList
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
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  /* ============================================================
   * 📄 DETALLE DE RESERVA
   * — Incluye todo (detalle completo)
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
            capacidadExtra: true,
            tarifaClp: true,
            tarifaExterno: true,
            extraSocioPorPersona: true,
            extraTerceroPorPersona: true,
            modalidadCobro: true,
            imagenUrl: true,
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
        user: true,
      },
    });
  },

  /* ============================================================
   * 🛠 ADMIN — COUNT (para paginación)
   * ============================================================ */
  adminCount(filtros: Prisma.ReservaWhereInput) {
    return prisma.reserva.count({ where: filtros });
  },

  /* ============================================================
   * 🛠 ADMIN — LISTADO PRO
   * ============================================================ */
  adminList(
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
        pago: true,
      },
    });
  },

  /* ============================================================
   * 🟦 DISPONIBILIDAD PISCINA (Día completo)
   * ============================================================ */
  piscinaPorFecha(fechaInicio: Date) {
    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: "PISCINA" },
        fechaInicio,
        estado: { not: ReservaEstado.CANCELADA }, // enum en lugar de string
      },
      select: {
        cantidadPersonas: true,
      },
    });
  },

};
