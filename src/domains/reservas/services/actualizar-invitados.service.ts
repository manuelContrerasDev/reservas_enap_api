// ============================================================
// actualizar-invitados.service.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { prisma } from "../../../lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";
import type { ActualizarInvitadosType } from "../validators/actualizar-invitados.schema";
import type { AuthUser } from "../../../types/global";
import { ReservasUpdateRepository } from "../repositories/update.repository";

type InvitadoLimpio = {
  nombre: string;
  rut: string;
  edad: number | null;
  esPiscina: boolean;
};

export const ActualizarInvitadosReservaService = {
  async ejecutar(
    reservaId: string,
    data: ActualizarInvitadosType,
    user: AuthUser
  ) {
    /* --------------------------------------------------------
     * 0) Seguridad básica
     * -------------------------------------------------------- */
    if (!user) throw new Error("NO_AUTH");
    if (!data || !Array.isArray(data.invitados)) {
      throw new Error("INVITADOS_INVALIDOS");
    }

    /* --------------------------------------------------------
     * 1) Obtener reserva
     * -------------------------------------------------------- */
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { invitados: true, espacio: true },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    /* --------------------------------------------------------
     * 2) Permisos
     * -------------------------------------------------------- */
    const esAdmin = user.role === "ADMIN";
    const esDueno = reserva.userId === user.id;

    if (!esAdmin && !esDueno) {
      throw new Error("NO_PERMITIDO");
    }

    /* --------------------------------------------------------
     * 3) Estados NO modificables
     * -------------------------------------------------------- */
    const estadosBloqueados: ReservaEstado[] = [
      ReservaEstado.CANCELADA,
      ReservaEstado.RECHAZADA,
      ReservaEstado.FINALIZADA,
      ReservaEstado.CADUCADA,
    ];

    if (estadosBloqueados.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_MODIFICABLE");
    }

    /* --------------------------------------------------------
     * 4) Regla temporal: nunca el día del evento o después
     * -------------------------------------------------------- */
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicio = new Date(reserva.fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (hoy >= inicio) {
      throw new Error("NO_PERMITIDO_TIEMPO");
    }

    /* --------------------------------------------------------
     * 5) Limpieza + validación de invitados
     * -------------------------------------------------------- */
    const invitadosLimpios: InvitadoLimpio[] = data.invitados.map((i) => {
      const nombre = String(i.nombre ?? "").trim();
      const rut = String(i.rut ?? "").trim();
      const edad =
        i.edad === undefined || i.edad === null ? null : Number(i.edad);
      const esPiscina = i.esPiscina ?? false;

      if (!nombre || !rut) {
        throw new Error("INVITADO_DATOS_INVALIDOS");
      }

      if (edad !== null) {
        if (!Number.isInteger(edad) || edad < 0) {
          throw new Error("EDAD_INVITADO_INVALIDA");
        }
      }

      return { nombre, rut, edad, esPiscina };
    });

    /* --------------------------------------------------------
     * 6) Regla ENAP: adultos no pueden exceder lo declarado
     * -------------------------------------------------------- */
    if (reserva.espacio.tipo !== TipoEspacio.PISCINA) {
      const adultosInvitados = invitadosLimpios.filter(
        (x) => (x.edad ?? 0) >= 12
      ).length;

      const adultosPermitidos = reserva.cantidadAdultos ?? 0;

      if (adultosInvitados > adultosPermitidos) {
        throw new Error("CANTIDAD_ADULTOS_SUPERADA");
      }
    }

    /* --------------------------------------------------------
     * 7) TX: reemplazo completo de invitados
     * -------------------------------------------------------- */
    await ReservasUpdateRepository.transaction(async (tx) => {
      await ReservasUpdateRepository.borrarInvitados(tx, reservaId);
      await ReservasUpdateRepository.crearInvitados(
        tx,
        reservaId,
        invitadosLimpios
      );
    });

    /* --------------------------------------------------------
     * 8) AuditLog (no bloqueante)
     * -------------------------------------------------------- */
    prisma.auditLog
      .create({
        data: {
          action: "ACTUALIZAR_INVITADOS",
          entity: "Reserva",
          entityId: reservaId,
          userId: user.id,
          details: {
            antes: reserva.invitados,
            despues: invitadosLimpios,
            rol: user.role,
          },
        },
      })
      .catch(() => {});

    /* --------------------------------------------------------
     * 9) Retornar reserva actualizada
     * -------------------------------------------------------- */
    return prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        espacio: true,
        invitados: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },
};
