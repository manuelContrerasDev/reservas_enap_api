// ============================================================
// reserva-manual.service.ts — ENAP 2025 (SYNC FINAL)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, TipoEspacio, Role } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { calcularReserva } from "../../utils/calcularReserva";
import { ReservasManualRepository } from "../../repositories/reservas/manual.repository";
import type { ReservaManualParsed } from "../../validators/reservas/reservaManual.schema";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRES_IN_MS = DAY_MS;

export const ReservaManualService = {
  async crear(data: ReservaManualParsed) {
    const {
      // Identidad
      userId,
      espacioId,
      creadaPor,

      // Fechas
      fechaInicio,
      fechaFin,

      // Cantidades
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,

      // Negocio
      usoReserva,
      marcarPagada = false,

      // 🔽 YA FLATTEN (desde Zod.transform)
      nombreSocio,
      rutSocio,
      telefonoSocio,
      correoEnap,
      correoPersonal,

      nombreResponsable,
      rutResponsable,
      emailResponsable,
      telefonoResponsable,

      socioPresente,
    } = data;

    /* --------------------------------------------------------
     * 0) Guard rails mínimos
     * -------------------------------------------------------- */
    if (!userId) throw new Error("USER_ID_REQUERIDO");
    if (!espacioId) throw new Error("ESPACIO_ID_REQUERIDO");
    if (!creadaPor) throw new Error("ADMIN_ID_REQUERIDO");

    if (typeof socioPresente !== "boolean") {
      throw new Error("SOCIO_PRESENTE_REQUERIDO");
    }

    const adultos = Math.max(0, Number(cantidadAdultos));
    const ninos = Math.max(0, Number(cantidadNinos));
    const piscina = Math.max(0, Number(cantidadPiscina));

    if (adultos < 1) {
      throw new Error("DEBE_HABER_AL_MENOS_1_ADULTO");
    }

    /* --------------------------------------------------------
     * 1) Usuario y espacio
     * -------------------------------------------------------- */
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new Error("USER_NOT_FOUND");

    const espacio = await prisma.espacio.findUnique({
      where: { id: espacioId },
    });
    if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

    /* --------------------------------------------------------
     * 2) Fechas
     * -------------------------------------------------------- */
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }
    if (fin <= inicio) throw new Error("FECHA_FIN_INVALIDA");
    if (inicio.getDay() === 1) throw new Error("INICIO_LUNES_NO_PERMITIDO");

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    if (espacio.tipo !== TipoEspacio.PISCINA) {
      if (dias < 3 || dias > 6) {
        throw new Error("DIAS_INVALIDOS");
      }
    }

    /* --------------------------------------------------------
     * 3) Responsable (REGLA REAL ENAP)
     * -------------------------------------------------------- */
    if (!socioPresente) {
      if (!nombreResponsable || !rutResponsable) {
        throw new Error("RESPONSABLE_OBLIGATORIO");
      }
    } else {
      if (
        nombreResponsable ||
        rutResponsable ||
        emailResponsable ||
        telefonoResponsable
      ) {
        throw new Error("RESPONSABLE_NO_PERMITIDO");
      }
    }

    /* --------------------------------------------------------
     * 4) Capacidad
     * -------------------------------------------------------- */
    const totalPersonas = adultos + ninos;

    if (espacio.tipo === TipoEspacio.CABANA && totalPersonas > 6) {
      throw new Error("CAPACIDAD_CABANA_SUPERADA");
    }

    if (espacio.tipo === TipoEspacio.QUINCHO) {
      const max = user.role === Role.SOCIO ? 15 : 10;
      if (totalPersonas > max) {
        throw new Error("CAPACIDAD_QUINCHO_SUPERADA");
      }
    }

    /* --------------------------------------------------------
     * 5) Disponibilidad
     * -------------------------------------------------------- */
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      const conflicto = await prisma.reserva.findFirst({
        where: {
          espacioId,
          estado: {
            in: [ReservaEstado.PENDIENTE_PAGO, ReservaEstado.CONFIRMADA],
          },
          NOT: {
            OR: [{ fechaFin: { lte: inicio } }, { fechaInicio: { gte: fin } }],
          },
        },
      });

      if (conflicto) {
        throw new Error("FECHAS_NO_DISPONIBLES");
      }
    }

    /* --------------------------------------------------------
     * 6) Cálculo financiero (motor oficial)
     * -------------------------------------------------------- */
    const precios = calcularReserva({
      espacio,
      dias,
      cantidadAdultos: adultos,
      cantidadNinos: ninos,
      cantidadPiscina: piscina,
      usoReserva,
      role: user.role,
    });

    /* --------------------------------------------------------
     * 7) Persistencia
     * -------------------------------------------------------- */
    const expiresAt = marcarPagada
      ? null
      : new Date(Date.now() + EXPIRES_IN_MS);

    return prisma.$transaction(async (tx) => {
      return ReservasManualRepository.crear(tx, {
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

        cantidadAdultos: adultos,
        cantidadNinos: ninos,
        cantidadPiscina: piscina,

        precioBaseSnapshot: precios.precioBaseSnapshot,
        precioPersonaSnapshot: precios.precioPersonaSnapshot,
        precioPiscinaSnapshot: precios.precioPiscinaSnapshot,
        totalClp: precios.totalClp,

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
      });
    });
  },
};
