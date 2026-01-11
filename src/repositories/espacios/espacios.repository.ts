// src/repositories/espacios.repository.ts

import { prisma } from "../../lib/db";
import { Prisma, ReservaEstado } from "@prisma/client";

export const EspaciosRepository = {
  /* ============================================================
   * 🟦 LECTURAS GENERALES
   * ============================================================ */

  // Uso ADMIN / filtros avanzados
  findMany(
    where: Prisma.EspacioWhereInput,
    orderBy: Prisma.EspacioOrderByWithRelationInput = { nombre: "asc" }
  ) {
    return prisma.espacio.findMany({ where, orderBy });
  },

  // Catálogo público (SOCIO / EXTERNO)
  findAllActive() {
    return prisma.espacio.findMany({
      where: {
        activo: true,
        visible: true,
      },
      orderBy: { nombre: "asc" },
    });
  },

  // ADMIN
  findById(id: string) {
    return prisma.espacio.findUnique({
      where: { id },
    });
  },

  // Público (detalle)
  findPublicById(id: string) {
    return prisma.espacio.findFirst({
      where: {
        id,
        activo: true,
        visible: true,
      },
    });
  },

  /* ============================================================
   * 🟩 CRUD
   * ============================================================ */

  create(data: Prisma.EspacioCreateInput) {
    return prisma.espacio.create({ data });
  },

  update(id: string, data: Prisma.EspacioUpdateInput) {
    return prisma.espacio.update({
      where: { id },
      data,
    });
  },

  /* ============================================================
   * 🟧 ESTADOS DE DOMINIO
   * ============================================================ */

  // Soft delete REAL del sistema
  // 👉 No rompe reservas históricas
  // 👉 Oculta de catálogo y bloquea nuevas reservas
  softDelete(id: string) {
    return prisma.espacio.update({
      where: { id },
      data: {
        activo: false,
        visible: false,
      },
    });
  },

  // Activar / desactivar (admin)
  toggle(id: string, current: boolean) {
    return prisma.espacio.update({
      where: { id },
      data: {
        activo: !current,
      },
    });
  },

  // ⚠️ Hard delete (NO usar en flujos normales)
  // Uso exclusivo: seeds / dev / limpieza manual
  delete(id: string) {
    return prisma.espacio.delete({
      where: { id },
    });
  },

  /* ============================================================
   * 🟥 DISPONIBILIDAD (RESERVAS ACTIVAS)
   * ============================================================ */

  findReservasActivasPorEspacio(espacioId: string) {
    return prisma.reserva.findMany({
      where: {
        espacioId,
        estado: {
          in: [
            ReservaEstado.PENDIENTE_PAGO,
            ReservaEstado.CONFIRMADA,
          ],
        },
      },
      select: {
        fechaInicio: true,
        fechaFin: true,
      },
      orderBy: {
        fechaInicio: "asc",
      },
    });
  },
};
