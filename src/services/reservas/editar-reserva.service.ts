// ============================================================
// editar-reserva.service.ts — ENAP 2025 (FINAL)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado } from "@prisma/client";
import type { AuthUser } from "../../types/global";

export const EditarReservaService = {
  async ejecutar(reservaId: string, data: any, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");

    // --------------------------------------------------------
    // 1) Obtener reserva
    // --------------------------------------------------------
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    // --------------------------------------------------------
    // 2) Permisos
    // --------------------------------------------------------
    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("NO_PERMITIDO");
    }

    // --------------------------------------------------------
    // 3) Estados bloqueados
    // --------------------------------------------------------
    const estadosBloqueados: ReservaEstado[] = [
      ReservaEstado.CANCELADA,
      ReservaEstado.RECHAZADA,
      ReservaEstado.CADUCADA,
      ReservaEstado.FINALIZADA,
    ];

    if (estadosBloqueados.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_MODIFICABLE");
    }

    // --------------------------------------------------------
    // 4) Bloqueo por fecha (reserva ya en curso)
    // --------------------------------------------------------
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicio = new Date(reserva.fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (hoy >= inicio) {
      throw new Error("NO_PERMITIDO_TIEMPO");
    }

    // --------------------------------------------------------
    // 5) Campos permitidos (whitelist)
    // --------------------------------------------------------
    const payload: any = {
      nombreSocio: data.nombreSocio,
      rutSocio: data.rutSocio,
      telefonoSocio: data.telefonoSocio,
      correoEnap: data.correoEnap,
      correoPersonal: data.correoPersonal ?? null,
      usoReserva: data.usoReserva,
      socioPresente: data.socioPresente,
      nombreResponsable: data.nombreResponsable ?? null,
      rutResponsable: data.rutResponsable ?? null,
      emailResponsable: data.emailResponsable ?? null,
      telefonoResponsable: data.telefonoResponsable ?? null,
    };

    // limpiar undefined
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    // --------------------------------------------------------
    // 6) Actualizar reserva
    // --------------------------------------------------------
    const actualizada = await prisma.reserva.update({
      where: { id: reservaId },
      data: payload,
    });

    // --------------------------------------------------------
    // 7) AuditLog
    // --------------------------------------------------------
    prisma.auditLog
      .create({
        data: {
          action: "EDITAR_RESERVA",
          entity: "Reserva",
          entityId: reservaId,
          userId: user.id,
          details: payload,
        },
      })
      .catch(() => {});

    return actualizada;
  },
};
