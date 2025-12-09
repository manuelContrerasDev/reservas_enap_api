// src/services/reservas/actualizar-invitados.service.ts

import { InvitadosRepository } from "../../repositories/reservas/invitados.repository";
import { prisma } from "../../config/db";

export const ActualizarInvitadosReservaService = {
  async ejecutar(reservaId: string, data: any, user: any) {

    if (!user) throw new Error("NO_AUTH");

    // Obtener reserva completa
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { invitados: true, user: true, espacio: true }
    });

    if (!reserva) throw new Error("NOT_FOUND");

    /* ============================================================
     * 🔐 PERMISOS
     * ============================================================ */
    if (user.role === "SOCIO" && reserva.userId !== user.sub)
      throw new Error("NO_PERMITIDO");

    if (user.role === "EXTERNO") {
      const relation = await prisma.guestAuthorization.findFirst({
        where: { invitadoId: user.sub },
      });

      if (!relation || relation.socioId !== reserva.userId)
        throw new Error("NO_PERMITIDO");
    }

    /* ============================================================
     * 📅 RESTRICCIÓN DE FECHA
     * ============================================================ */
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicio = new Date(reserva.fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (hoy >= inicio)
      throw new Error("NO_PERMITIDO_TIEMPO");

    /* ============================================================
     * 👥 VALIDACIÓN DE CANTIDAD (solo cabaña/quincho)
     * ============================================================ */
    if (reserva.espacio.tipo !== "PISCINA") {
      if (data.invitados.length !== reserva.cantidadPersonas)
        throw new Error(
          `Debes registrar exactamente ${reserva.cantidadPersonas} invitados`
        );
    }

    if (!Array.isArray(data.invitados))
      throw new Error("INVITADOS_INVALIDOS");

    /* ============================================================
     * 🔵 TRANSACCIÓN SEGURA
     * ============================================================ */
    await prisma.$transaction([
      InvitadosRepository.borrarPorReservaRaw(reservaId),
      InvitadosRepository.crearListaRaw(reservaId, data.invitados),
    ]);

    /* ============================================================
     * ✔ Retornar reserva completa actualizada
     * ============================================================ */
    return prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        espacio: true,
        invitados: true,
        user: { select: { id: true, name: true, email: true } }
      },
    });
  },
};
