// src/services/reservas/actualizar-invitados.service.ts
import { prisma } from "../../lib/db";
import { ReservaEstado, TipoEspacio } from "@prisma/client";
import type { ActualizarInvitadosType } from "../../validators/reservas/actualizar-invitados.schema";
import type { AuthUser } from "../../types/global";
import { ReservasUpdateRepository } from "../../repositories/reservas/update.repository";

type InvitadoLimpio = {
  nombre: string;
  rut: string;
  edad: number | null;
  esPiscina: boolean;
};

export const ActualizarInvitadosReservaService = {
  async ejecutar(reservaId: string, data: ActualizarInvitadosType, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");
    if (!data || !Array.isArray(data.invitados)) throw new Error("INVITADOS_INVALIDOS");

    // 1) Obtener reserva (para permisos + estados + reglas)
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { invitados: true, espacio: true },
    });
    if (!reserva) throw new Error("NOT_FOUND");

    // 2) Permisos
    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("NO_PERMITIDO");
    }

    // 3) Estados bloqueados
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

    // 4) Ventana 24h
    const ahora = new Date();
    const limite = new Date(reserva.createdAt.getTime() + 24 * 60 * 60 * 1000);
    if (ahora > limite) throw new Error("FUERA_DE_VENTANA_EDICION");

    // 5) No permitir día del evento
    const inicio = new Date(reserva.fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (hoy >= inicio) throw new Error("NO_PERMITIDO_TIEMPO");

    // 6) Limpieza + validación suave
    const invitadosLimpios: InvitadoLimpio[] = data.invitados.map((i) => {
      const nombre = String(i.nombre ?? "").trim();
      const rut = String(i.rut ?? "").trim();

      const edad =
        i.edad === undefined || i.edad === null ? null : Number(i.edad);

      const esPiscina = i.esPiscina ?? false;

      if (!nombre || !rut) throw new Error("INVITADO_DATOS_INVALIDOS");

      if (edad != null) {
        if (Number.isNaN(edad) || !Number.isInteger(edad) || edad < 0) {
          throw new Error("EDAD_INVITADO_INVALIDA");
        }
      }

      return { nombre, rut, edad, esPiscina };
    });

    // 7) Regla ENAP coherente:
    // Para NO piscina, no permitir más adultos invitados que los adultos declarados en la reserva.
    if (reserva.espacio.tipo !== TipoEspacio.PISCINA) {
      const adultosInvitados = invitadosLimpios.filter((x) => (x.edad ?? 0) >= 12).length;
      const adultosPermitidos = reserva.cantidadAdultos ?? 0;

      if (adultosInvitados > adultosPermitidos) {
        throw new Error("CANTIDAD_ADULTOS_SUPERADA");
      }
    }

    // 8) TX: reemplazo completo
    await ReservasUpdateRepository.transaction(async (tx) => {
      await ReservasUpdateRepository.borrarInvitados(tx, reservaId);
      await ReservasUpdateRepository.crearInvitados(tx, reservaId, invitadosLimpios);
    });

    // 9) AuditLog (no bloqueante)
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
          },
        },
      })
      .catch(() => {});

    // 10) Retornar reserva actualizada
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
