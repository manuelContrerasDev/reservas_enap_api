// src/services/reservas/reserva-manual.service.ts — ENAP 2025

import { prisma } from "../../lib/db";
import { calcularReserva } from "../../utils/calcularReserva";
import { EmailService } from "../EmailService";
import { ReservaEstado, TipoEspacio } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

export const ReservaManualService = {
  async crear(input: any) {
    const {
      userId,
      espacioId,
      fechaInicio,
      fechaFin,
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,
      usoReserva, // USO_PERSONAL / CARGA_DIRECTA / TERCEROS
      creadaPor,
      marcarPagada = false,

      nombreSocio,
      rutSocio,
      telefonoSocio,
      correoEnap,
      correoPersonal,

      nombreResponsable,
      rutResponsable,
      emailResponsable,
      telefonoResponsable,
    } = input;

    // 1) Usuario + espacio
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");

    const espacio = await prisma.espacio.findUnique({ where: { id: espacioId } });
    if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

    // 2) Fechas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }

    if (fin <= inicio) throw new Error("FECHA_FIN_INVALIDA");
    if (inicio.getDay() === 1) throw new Error("INICIO_LUNES_NO_PERMITIDO");

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    if (espacio.tipo !== TipoEspacio.PISCINA) {
      if (dias < 3 || dias > 6) throw new Error("DIAS_INVALIDOS");
    }

    // 3) Capacidad
    const totalInvitados = cantidadAdultos + cantidadNinos;

    if (espacio.tipo === TipoEspacio.QUINCHO) {
      const max = user.role === "SOCIO" ? 15 : 10;
      if (totalInvitados > max) {
        throw new Error("CAPACIDAD_QUINCHO_SUPERADA");
      }
    }

    if (espacio.tipo === TipoEspacio.CABANA) {
      if (totalInvitados > 6) {
        throw new Error("CAPACIDAD_CABANA_SUPERADA");
      }
    }

    if (espacio.tipo === TipoEspacio.PISCINA) {
      if (cantidadPiscina > 100) {
        throw new Error("CAPACIDAD_PISCINA_SUPERADA");
      }
    }

    // 4) Responsable
    if (usoReserva === "USO_PERSONAL" && nombreResponsable) {
      throw new Error("RESPONSABLE_NO_PERMITIDO_EN_USO_PERSONAL");
    }

    if (usoReserva !== "USO_PERSONAL") {
      if (!nombreResponsable || !rutResponsable) {
        throw new Error("RESPONSABLE_OBLIGATORIO");
      }
    }

    // 5) Disponibilidad (igual que crear.service)
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      const conflicto = await prisma.reserva.findFirst({
        where: {
          espacioId,
          estado: {
            in: [
              ReservaEstado.PENDIENTE_PAGO,
              ReservaEstado.CONFIRMADA,
              ReservaEstado.PENDIENTE,
            ],
          },
          NOT: {
            OR: [
              { fechaFin: { lte: inicio } },
              { fechaInicio: { gte: fin } },
            ],
          },
        },
      });

      if (conflicto) throw new Error("FECHAS_NO_DISPONIBLES");
    }

    // 6) Cálculo financiero oficial
    const costo = calcularReserva({
      espacio,
      dias,
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,
      usoReserva,
      role: user.role, // SOCIO / EXTERNO — EXTERNO siempre paga externo
    });

    const expiresAt = marcarPagada ? null : new Date(Date.now() + 86400000);

    // 7) Crear reserva
    const reserva = await prisma.reserva.create({
      data: {
        userId,
        espacioId,
        fechaInicio: inicio,
        fechaFin: fin,
        dias,

        usoReserva,
        estado: marcarPagada
          ? ReservaEstado.CONFIRMADA
          : ReservaEstado.PENDIENTE_PAGO,
        expiresAt,

        precioBaseSnapshot: costo.precioBaseSnapshot,
        precioPersonaSnapshot: costo.precioPersonaSnapshot,
        precioPiscinaSnapshot: costo.precioPiscinaSnapshot,
        totalClp: costo.totalClp,

        cantidadAdultos,
        cantidadNinos,
        cantidadPiscina,

        nombreSocio,
        rutSocio,
        telefonoSocio,
        correoEnap,
        correoPersonal,

        nombreResponsable,
        rutResponsable,
        emailResponsable,
        telefonoResponsable,

        creadaPor,
      },
    });

    // 8) Email pago si no está marcada Pagada
    if (!marcarPagada) {
      await this.enviarCorreoPago(reserva);
    }

    return reserva;
  },

  async enviarCorreoPago(reserva: any) {
    const to = reserva.correoPersonal ?? reserva.correoEnap;
    if (!to) return;

    const inicio = new Date(reserva.fechaInicio).toLocaleDateString("es-CL");
    const fin = new Date(reserva.fechaFin).toLocaleDateString("es-CL");

    const pagoUrl = `${process.env.WEB_URL}/pago/iniciar?reservaId=${reserva.id}`;

    await EmailService.sendManualReservationEmail({
      to,
      name: reserva.nombreSocio,
      fecha: `${inicio} — ${fin}`,
      espacio: reserva.espacio?.nombre ?? "Espacio ENAP",
      pagoUrl,
    });
  },
};
