// ============================================================
// actualizar-invitados.service.ts — ENAP 2025 (FINAL APLICADO)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";
import { InvitadosRepository } from "../../repositories/reservas/invitados.repository";

type InvitadoInput = {
  id?: string;
  nombre: string;
  rut: string;
  edad?: number | null;
  esPiscina?: boolean;
};

export const ActualizarInvitadosReservaService = {
  async ejecutar(reservaId: string, data: any, user: any) {
    if (!user) throw new Error("NO_AUTH");

    // --------------------------------------------------------
    // 1) Validar payload básico
    // --------------------------------------------------------
    if (!data || !Array.isArray(data.invitados)) {
      throw new Error("INVITADOS_INVALIDOS");
    }

    const invitadosInput = data.invitados as InvitadoInput[];

    // --------------------------------------------------------
    // 2) Obtener reserva actual
    // --------------------------------------------------------
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        invitados: true,
        espacio: true,
        user: true,
      },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    // --------------------------------------------------------
    // 3) Permisos
    // --------------------------------------------------------
    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("NO_PERMITIDO");
    }

    // --------------------------------------------------------
    // 4) Estados donde NO se permite modificar
    // --------------------------------------------------------
    const estadosNoModificables: ReservaEstado[] = [
      ReservaEstado.CANCELADA,
      ReservaEstado.RECHAZADA,
      ReservaEstado.FINALIZADA,
      ReservaEstado.CADUCADA,
      ReservaEstado.CONFIRMADA,
    ];

    if (estadosNoModificables.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_MODIFICABLE");
    }

    // --------------------------------------------------------
    // 5) Ventana de edición: máximo 24 horas desde creación
    // --------------------------------------------------------
    const ahora = new Date();
    const limiteEdicion = new Date(
      reserva.createdAt.getTime() + 24 * 60 * 60 * 1000
    );

    if (ahora > limiteEdicion) {
      throw new Error("FUERA_DE_VENTANA_EDICION");
    }

    // --------------------------------------------------------
    // 6) Bloqueo por fecha de uso (día del evento)
    // --------------------------------------------------------
    const inicio = new Date(reserva.fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (ahora >= inicio) {
      throw new Error("NO_PERMITIDO_TIEMPO");
    }

    // --------------------------------------------------------
    // 7) Limpieza y validación suave de invitados
    // --------------------------------------------------------
    const invitadosLimpios = invitadosInput.map((raw) => {
      const nombre = String(raw.nombre ?? "").trim();
      const rut = String(raw.rut ?? "").trim();
      const edad =
        raw.edad === undefined || raw.edad === null
          ? null
          : Number(raw.edad);

      const esPiscina =
        raw.esPiscina === undefined ? false : Boolean(raw.esPiscina);

      if (!nombre || !rut) throw new Error("INVITADO_DATOS_INVALIDOS");

      if (edad != null && (Number.isNaN(edad) || edad < 0)) {
        throw new Error("EDAD_INVITADO_INVALIDA");
      }

      return { nombre, rut, edad, esPiscina };
    });

    // --------------------------------------------------------
    // 8) Validación suave por tipo de espacio
    // --------------------------------------------------------
    if (reserva.espacio.tipo !== TipoEspacio.PISCINA) {
      const adultosInvitados = invitadosLimpios.filter(
        (i) => (i.edad ?? 0) >= 12
      ).length;

      const adultosPermitidos = reserva.cantidadAdultos;

      if (adultosInvitados > adultosPermitidos) {
        throw new Error("CANTIDAD_ADULTOS_SUPERADA");
      }
    }

    // --------------------------------------------------------
    // 9) Transacción: reemplazo completo de invitados
    // --------------------------------------------------------
    await prisma.$transaction([
      InvitadosRepository.borrarPorReservaRaw(reservaId),
      InvitadosRepository.crearListaRaw(reservaId, invitadosLimpios),
    ]);

    // --------------------------------------------------------
    // 10) AuditLog (no bloqueante)
    // --------------------------------------------------------
    prisma.auditLog
      .create({
        data: {
          action: "ACTUALIZAR_INVITADOS",
          entity: "Reserva",
          entityId: reservaId,
          userId: user.id ?? null,
          details: {
            antes: reserva.invitados,
            despues: invitadosLimpios,
          },
        },
      })
      .catch(() => {});

    // --------------------------------------------------------
    // 11) Devolver reserva actualizada
    // --------------------------------------------------------
    return prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        espacio: true,
        invitados: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },
};
