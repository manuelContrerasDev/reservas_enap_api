// ============================================================
// confirmar-reserva-admin.service.ts — ENAP 2025 (ADMIN)
// ============================================================

import { prisma } from "../../../lib/db";
import {
  ReservaEstado,
  Role,
} from "@prisma/client";
import { calcularReserva } from "../utils/calcularReserva";

interface Params {
  reservaId: string;
  adminId: string;
  adminRole: Role;
}

export const ConfirmarReservaAdminService = {
  async ejecutar({ reservaId, adminId, adminRole }: Params) {
    /* =========================================================
     * Auth
     * ========================================================= */
    if (adminRole !== Role.ADMIN) {
      throw new Error("NO_AUTORIZADO_ADMIN");
    }

    /* =========================================================
     * Reserva
     * ========================================================= */
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        espacio: true,
        invitados: true,
      },
    });

    if (!reserva) throw new Error("RESERVA_NOT_FOUND");

    if (reserva.estado !== ReservaEstado.PENDIENTE_PAGO) {
      throw new Error("ESTADO_INVALIDO");
    }

    /* =========================================================
     * 🔑 ROLE REAL (NUNCA NULL)
     * ========================================================= */
    const role: Role =
  reserva.usoReserva === "TERCEROS"
    ? Role.EXTERNO
    : Role.SOCIO;

    const precios = calcularReserva({
    espacio: {
        tipo: reserva.espacio.tipo,
        modalidadCobro: reserva.espacio.modalidadCobro,
        precioBaseSocio: reserva.espacio.precioBaseSocio,
        precioBaseExterno: reserva.espacio.precioBaseExterno,
        precioPersonaAdicionalSocio:
        reserva.espacio.precioPersonaAdicionalSocio,
        precioPersonaAdicionalExterno:
        reserva.espacio.precioPersonaAdicionalExterno,
        precioPiscinaSocio: reserva.espacio.precioPiscinaSocio,
        precioPiscinaExterno: reserva.espacio.precioPiscinaExterno,
    },
    dias: reserva.dias,
    cantidadAdultos: reserva.cantidadAdultos,
    cantidadNinos: reserva.cantidadNinos,
    cantidadPiscina: reserva.cantidadPiscina,
    usoReserva: reserva.usoReserva,
    role,
    });

    /* =========================================================
     * Persistencia + Audit
     * ========================================================= */
    return prisma.$transaction(async (tx) => {
      const updated = await tx.reserva.update({
        where: { id: reservaId },
        data: {
          estado: ReservaEstado.CONFIRMADA,

          precioBaseSnapshot: precios.precioBaseSnapshot,
          precioPersonaSnapshot: precios.precioPersonaSnapshot,
          precioPiscinaSnapshot: precios.precioPiscinaSnapshot,
          totalClp: precios.totalClp,

          confirmedAt: new Date(),
          confirmedBy: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "RESERVA_CONFIRMADA_ADMIN",
          entity: "RESERVA",
          entityId: reservaId,
          userId: adminId,
          details: {
            totalClp: precios.totalClp,
            invitados: reserva.invitados.length,
          },
        },
      });

      return updated;
    });
  },
};
