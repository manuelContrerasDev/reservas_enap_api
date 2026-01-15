// ============================================================
// crear.service.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { prisma } from "../../lib/db";
import { ReservaEstado, Role, TipoEspacio } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { calcularReserva } from "../../domain/reservas/utils/calcularReserva";
import { ReservasCreateRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";
import type { CrearReservaType } from "../../validators/reservas";

export const CrearReservaService = {
  async ejecutar(data: CrearReservaType, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");

    /* --------------------------------------------------------
     * 1) Obtener espacio
     * -------------------------------------------------------- */
    const espacio = await prisma.espacio.findUnique({
      where: { id: data.espacioId },
    });
    if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

    /* --------------------------------------------------------
     * 2) Fechas
     * -------------------------------------------------------- */
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    /* --------------------------------------------------------
    * 3) Disponibilidad (NO piscina)
    * -------------------------------------------------------- */
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      const solapadas = await prisma.reserva.count({
        where: {
          espacioId: espacio.id,
          estado: {
            in: [
              ReservaEstado.PENDIENTE_PAGO,
              ReservaEstado.CONFIRMADA,
            ],
          },
          cancelledAt: null,
          NOT: {
            OR: [
              { fechaFin: { lte: inicio } },
              { fechaInicio: { gte: fin } },
            ],
          },
        },
      });

      if (solapadas > 0) {
        throw new Error("FECHAS_NO_DISPONIBLES");
      }
    }

    /* --------------------------------------------------------
     * 4) Invitados y cantidades
     * -------------------------------------------------------- */
    const invitados = data.invitados.map(i => ({
      nombre: i.nombre.trim(),
      rut: i.rut.trim(),
      edad: i.edad ?? null,
      esPiscina: i.esPiscina ?? false,
    }));

    const cantidadAdultos =
      invitados.filter(i => (i.edad ?? 0) >= 12).length +
      (data.socioPresente ? 1 : 0);

    const cantidadNinos =
      invitados.filter(i => (i.edad ?? 0) < 12).length;

    const cantidadPiscina =
      invitados.filter(i => i.esPiscina).length;

    /* --------------------------------------------------------
     * 5) Capacidad
     * -------------------------------------------------------- */
    if (espacio.tipo === TipoEspacio.CABANA && cantidadAdultos + cantidadNinos > 6) {
      throw new Error("CAPACIDAD_CABANA_SUPERADA");
    }

    if (espacio.tipo === TipoEspacio.QUINCHO) {
      const max = user.role === Role.SOCIO ? 15 : 10;
      if (cantidadAdultos + cantidadNinos > max) {
        throw new Error("CAPACIDAD_QUINCHO_SUPERADA");
      }
    }

    /* --------------------------------------------------------
     * 6) Cálculo financiero
     * -------------------------------------------------------- */
    const precios = calcularReserva({
      espacio: {
        tipo: espacio.tipo,
        modalidadCobro: espacio.modalidadCobro,
        precioBaseSocio: espacio.precioBaseSocio,
        precioBaseExterno: espacio.precioBaseExterno,
        precioPersonaAdicionalSocio:
        espacio.precioPersonaAdicionalSocio,
        precioPersonaAdicionalExterno:
        espacio.precioPersonaAdicionalExterno,
        precioPiscinaSocio: espacio.precioPiscinaSocio,
        precioPiscinaExterno: espacio.precioPiscinaExterno,
      },
      dias,
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,
      usoReserva: data.usoReserva,
      role: user.role,
    });

    /* --------------------------------------------------------
     * 7) Persistencia (transacción)
     * -------------------------------------------------------- */
    const reserva = await prisma.$transaction(async tx => {
      const r = await ReservasCreateRepository.crearReserva(tx, {
        userId: user.id,
        espacioId: espacio.id,
        fechaInicio: inicio,
        fechaFin: fin,
        dias,
        estado: ReservaEstado.PENDIENTE_PAGO,
        expiresAt: new Date(Date.now() + 86400000),
        cantidadAdultos,
        cantidadNinos,
        cantidadPiscina,
        precioBaseSnapshot: precios.precioBaseSnapshot,
        precioPersonaSnapshot: precios.precioPersonaSnapshot,
        precioPiscinaSnapshot: precios.precioPiscinaSnapshot,
        totalClp: precios.totalClp,
        nombreSocio: data.nombreSocio,
        rutSocio: data.rutSocio,
        telefonoSocio: data.telefonoSocio,
        correoEnap: data.correoEnap,
        correoPersonal: data.correoPersonal ?? null,
        usoReserva: data.usoReserva,
        nombreResponsable: data.nombreResponsable ?? null,
        rutResponsable: data.rutResponsable ?? null,
        emailResponsable: data.emailResponsable ?? null,
        telefonoResponsable: data.telefonoResponsable ?? null,
        terminosAceptados: true,
        terminosVersion: data.terminosVersion ?? "2025-ENAP",
      });

      await ReservasCreateRepository.crearInvitados(tx, r.id, invitados);
      return r;
    });

    return reserva;
  },
};
