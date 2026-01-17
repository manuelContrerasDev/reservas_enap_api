import { prisma } from "../../../../lib/db";
import { ReservaEstado, PaymentStatus } from "@prisma/client";
import type { AuthUser } from "../../../../types/global";
import type { EditReservaType } from "../../validators/edit-reserva.schema";

export const EditarReservaAdminService = {
  async ejecutar(reservaId: string, data: EditReservaType, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");

    // 🔐 SOLO ADMIN
    if (user.role !== "ADMIN") {
      throw new Error("NO_PERMITIDO");
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        pago: { select: { status: true } },
      },
    });

    if (!reserva) throw new Error("NOT_FOUND");

    /* ⛔ Estados bloqueados */
    const estadosBloqueados: ReservaEstado[] = [
      ReservaEstado.RECHAZADA,
      ReservaEstado.CADUCADA,
      ReservaEstado.FINALIZADA,
    ];

    if (estadosBloqueados.includes(reserva.estado)) {
      throw new Error("RESERVA_NO_MODIFICABLE");
    }

    /* 💳 Pago aprobado bloquea edición */
    if (reserva.pago?.status === PaymentStatus.APPROVED) {
      throw new Error("PAGO_CONFIRMADO");
    }

    /* 📅 No permitir editar desde el día del evento */
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicio = new Date(reserva.fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (hoy >= inicio) {
      throw new Error("NO_PERMITIDO_TIEMPO");
    }

    /* 🧠 Normalización defensiva */
    const updateData = {
      nombreSocio: data.nombreSocio,
      rutSocio: data.rutSocio,
      telefonoSocio: data.telefonoSocio,
      correoEnap: data.correoEnap,
      correoPersonal: data.correoPersonal ?? null,

      nombreResponsable: data.socioPresente ? null : data.nombreResponsable ?? null,
      rutResponsable: data.socioPresente ? null : data.rutResponsable ?? null,
      emailResponsable: data.socioPresente ? null : data.emailResponsable ?? null,
      telefonoResponsable: data.socioPresente
        ? null
        : data.telefonoResponsable ?? null,
    };

    Object.keys(updateData).forEach((k) => {
      if (updateData[k as keyof typeof updateData] === undefined) {
        delete updateData[k as keyof typeof updateData];
      }
    });

    /* 📝 Update con INCLUDE para DTO */
    const actualizada = await prisma.reserva.update({
      where: { id: reservaId },
      data: updateData,
      include: {
        espacio: true,
        invitados: true,
        pago: true,
      },
    });

    /* 📜 AuditLog */
    prisma.auditLog
      .create({
        data: {
          action: "EDITAR_RESERVA_ADMIN",
          entity: "Reserva",
          entityId: reservaId,
          userId: user.id,
          before: {
            nombreSocio: reserva.nombreSocio,
            telefonoSocio: reserva.telefonoSocio,
            correoPersonal: reserva.correoPersonal,
            nombreResponsable: reserva.nombreResponsable,
            rutResponsable: reserva.rutResponsable,
            emailResponsable: reserva.emailResponsable,
            telefonoResponsable: reserva.telefonoResponsable,
          },
          after: updateData,
        },
      })
      .catch(() => {});

    return actualizada;
  },
};
