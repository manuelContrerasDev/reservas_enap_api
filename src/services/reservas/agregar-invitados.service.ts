// ============================================================
// agregar-invitados.service.ts — ENAP 2025 (ADMIN · PRO)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";

/* ================= TIPOS ================= */

type InvitadoInput = {
  nombre: string;
  rut: string;
  edad?: number;
  esPiscina?: boolean;
};

interface Params {
  reservaId: string;
  invitados: InvitadoInput[];
  adminId: string;
}

/* ================= SERVICE ================= */

export const AgregarInvitadosService = {
  async ejecutar({ reservaId, invitados, adminId }: Params) {
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        espacio: true,
        invitados: true,
      },
    });

    if (!reserva) {
      throw new Error("RESERVA_NOT_FOUND");
    }

    if (reserva.estado !== ReservaEstado.PENDIENTE_PAGO) {
      throw new Error("ESTADO_INVALIDO");
    }

    /* ================= VALIDACIONES ================= */

    const adultosInv = invitados.filter(
      (i: InvitadoInput) => (i.edad ?? 18) >= 12
    ).length;

    const ninosInv = invitados.filter(
      (i: InvitadoInput) => (i.edad ?? 0) < 12
    ).length;

    const piscinaInv = invitados.filter(
      (i: InvitadoInput) => i.esPiscina === true
    ).length;

    if (
      adultosInv > reserva.cantidadAdultos ||
      ninosInv > reserva.cantidadNinos ||
      piscinaInv > reserva.cantidadPiscina
    ) {
      throw new Error("INVITADOS_SUPERAN_DECLARADO");
    }

    /* ================= TRANSACCIÓN ================= */

    return prisma.$transaction(async (tx) => {
      // 1. Eliminar invitados previos
      await tx.invitado.deleteMany({
        where: { reservaId },
      });

      // 2. Crear invitados nuevos
      await tx.invitado.createMany({
        data: invitados.map((i: InvitadoInput) => ({
          nombre: i.nombre.trim(),
          rut: i.rut.trim(),
          edad: i.edad ?? null,
          esPiscina: i.esPiscina ?? false,
          reservaId,
        })),
      });

      // 3. AuditLog
      await tx.auditLog.create({
        data: {
          action: "INVITADOS_ADMIN_ACTUALIZADOS",
          entity: "RESERVA",
          entityId: reservaId,
          userId: adminId,
          details: {
            totalInvitados: invitados.length,
            adultos: adultosInv,
            ninos: ninosInv,
            piscina: piscinaInv,
          },
        },
      });

      // 4. Retornar reserva actualizada
      return tx.reserva.findUniqueOrThrow({
        where: { id: reservaId },
        include: {
          invitados: true,
          espacio: true,
        },
      });
    });
  },
};
