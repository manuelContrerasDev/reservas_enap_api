import { prisma } from "../../lib/db";
import { ReservaEstado, TipoEspacio, Role } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { calcularReserva } from "../../utils/calcularReserva";
import { ReservasManualRepository } from "../../repositories/reservas/manual.repository";
import type { ReservaManualRequest } from "../../validators/reservas/reservaManual.schema";
import { mapReservaManualToCreateInput } from "../../mappers/reservaManual.mapper";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRES_IN_MS = DAY_MS;

export const ReservaManualService = {
  async crear(data: ReservaManualRequest) {
    const {
      userId,
      espacioId,
      creadaPor,
      fechaInicio,
      fechaFin,
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,
      usoReserva,
      marcarPagada = false,
      socioPresente,
    } = data;

    /* --------------------------------------------------------
     * 0) Guard rails mínimos
     * -------------------------------------------------------- */
    if (!userId) throw new Error("USER_ID_REQUERIDO");
    if (!espacioId) throw new Error("ESPACIO_ID_REQUERIDO");
    if (!creadaPor) throw new Error("ADMIN_ID_REQUERIDO");

    const adultos = Math.max(0, cantidadAdultos);
    const ninos = Math.max(0, cantidadNinos);
    const piscina = Math.max(0, cantidadPiscina);

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
     * 3) Capacidad
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
     * 4) Disponibilidad
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

      if (conflicto) throw new Error("FECHAS_NO_DISPONIBLES");
    }

    /* --------------------------------------------------------
     * 5) Cálculo financiero
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
     * 6) Persistencia (mapper)
     * -------------------------------------------------------- */
    const expiresAt = marcarPagada
      ? null
      : new Date(Date.now() + EXPIRES_IN_MS);

    const createData = {
      ...mapReservaManualToCreateInput(data),
      dias,
      estado: marcarPagada
        ? ReservaEstado.CONFIRMADA
        : ReservaEstado.PENDIENTE_PAGO,
      expiresAt,
      precioBaseSnapshot: precios.precioBaseSnapshot,
      precioPersonaSnapshot: precios.precioPersonaSnapshot,
      precioPiscinaSnapshot: precios.precioPiscinaSnapshot,
      totalClp: precios.totalClp,
    };

    return prisma.$transaction(async (tx) => {
      return ReservasManualRepository.crear(tx, createData);
    });
  },
};
