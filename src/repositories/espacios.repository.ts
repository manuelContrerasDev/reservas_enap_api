// src/repositories/espacios.repository.ts

import { prisma } from "../lib/db";
import { Prisma, ReservaEstado } from "@prisma/client";

export const EspaciosRepository = {
  /* ============================================================
   * 🟦 LECTURA GENERAL
   * ============================================================*/

  findMany(
    where: Prisma.EspacioWhereInput,
    orderBy: Prisma.EspacioOrderByWithRelationInput = { nombre: "asc" }
  ) {
    return prisma.espacio.findMany({ where, orderBy });
  },

  findAllActive() {
    return prisma.espacio.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
  },

  findById(id: string) {
    return prisma.espacio.findUnique({
      where: { id },
    });
  },

  /* ============================================================
   * 🟩 CRUD
   * ============================================================*/

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
   * 🟧 ESTADOS (activo / soft delete)
   * ============================================================*/

  softDelete(id: string) {
    return prisma.espacio.update({
      where: { id },
      data: { activo: false },
    });
  },

  toggle(id: string, current: boolean) {
    return prisma.espacio.update({
      where: { id },
      data: { activo: !current },
    });
  },

  delete(id: string) {
    return prisma.espacio.delete({
      where: { id },
    });
  },

  /* ============================================================
   * 🟥 RESERVAS — DISPONIBILIDAD
   * ============================================================*/

  findReservasActivasPorEspacio(espacioId: string) {
    return prisma.reserva.findMany({
      where: {
        espacioId,
        estado: {
          in: [
            ReservaEstado.PENDIENTE,
            ReservaEstado.PENDIENTE_PAGO,
            ReservaEstado.CONFIRMADA,
          ],
        },
      },
      select: { fechaInicio: true, fechaFin: true },
      orderBy: { fechaInicio: "asc" },
    });
  },
};
