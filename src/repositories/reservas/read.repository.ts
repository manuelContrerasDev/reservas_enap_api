// ============================================================
// src/repositories/reservas/read.repository.ts
// ENAP 2025 — PRODUCTION READY
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";

export const ReservasReadRepository = {

  /* ============================================================
   * 👤 MIS RESERVAS (Usuario autenticado)
   * ============================================================ */
  misReservas(userId: string) {
    return prisma.reserva.findMany({
      where: { userId },

      orderBy: {
        fechaInicio: "desc",
      },

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
   * 📄 DETALLE RESERVA (full lectura)
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

            // ✔ NOMBRES REALES DEL MODELO PRISMA
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

  /* ============================================================
   * 🟦 DISPONIBILIDAD PISCINA — Día completo (FIX TIMEZONE)
   * ============================================================ */
  piscinaPorFecha(fecha: Date) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    return prisma.reserva.findMany({
      where: {
        espacio: { tipo: "PISCINA" },
        estado: { not: ReservaEstado.CANCELADA },
        fechaInicio: {
          gte: inicioDia,
          lte: finDia,
        },
      },

      select: {
        cantidadPiscina: true,
      },
    });
  },
};
