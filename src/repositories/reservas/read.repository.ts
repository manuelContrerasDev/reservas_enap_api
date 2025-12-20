// ============================================================
// src/repositories/reservas/read.repository.ts
// ENAP 2025 — Versión Oficial
// ============================================================

import { prisma } from "../../lib/db";
import { Prisma, ReservaEstado } from "@prisma/client";

export const ReservasReadRepository = {

  /* ============================================================
   * 👤 MIS RESERVAS (Socio / Externo autorizado)
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
   * 📄 DETALLE RESERVA (FULL)
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

            // 🔥 Nuevas tarifas ENAP 2025
            precioBaseSocio: true,
            precioBaseExterno: true,
            precioPersonaSocio: true,
            precioPersonaExterno: true,
            precioPiscinaSocio: true,
            precioPiscinaExterno: true,
          },
        },

        // Invitados asociados
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
   * 🛠 ADMIN — COUNT
   * ============================================================ */
  adminCount(filtros: Prisma.ReservaWhereInput) {
    return prisma.reserva.count({ where: filtros });
  },

  /* ============================================================
   * 🛠 ADMIN — LISTADO COMPLETO
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
            capacidad: true,
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
   * 🟦 DISPONIBILIDAD PISCINA — Día completo
   * ============================================================ */
  piscinaPorFecha(fechaInicio: Date) {
    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: "PISCINA" },
        fechaInicio,
        estado: { not: ReservaEstado.CANCELADA },
      },
      select: {
        cantidadPiscina: true, // model update
      },
    });
  },

};
