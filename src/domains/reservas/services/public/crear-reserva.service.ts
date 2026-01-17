// ============================================================
// crear.service.ts — ENAP 2025 (SYNC WITH ESPACIOS)
// ============================================================

import { prisma } from "../../../../lib/db";
import { ReservaEstado } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { calcularReserva } from "../../utils/calcularReserva";
import { ReservasCreateRepository } from "../../repositories";
import type { AuthUser } from "../../../../types/global";
import type { CrearReservaType } from "../../validators";

export const CrearReservaService = {
  async ejecutar(data: CrearReservaType, user: AuthUser) {
    if (!user) throw new Error("NO_AUTH");

    /* --------------------------------------------------------
     * 1) Obtener espacio (unidad ya validada por Módulo ESPACIOS)
     * -------------------------------------------------------- */
    const espacio = await prisma.espacio.findUnique({
      where: { id: data.espacioId },
    });

    if (!espacio) {
      throw new Error("ESPACIO_NOT_FOUND");
    }

    /* --------------------------------------------------------
     * 2) Fechas
     * -------------------------------------------------------- */
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }

    if (inicio > fin) {
      throw new Error("RANGO_FECHAS_INVALIDO");
    }

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    /* --------------------------------------------------------
     * 3) Invitados y cantidades (snapshot)
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
     * 4) Capacidad (FUENTE ÚNICA: espacio.capacidad)
     * -------------------------------------------------------- */
    const totalPersonas = cantidadAdultos + cantidadNinos;

    if (espacio.capacidad && totalPersonas > espacio.capacidad) {
      throw new Error("CAPACIDAD_SUPERADA");
    }

    /* --------------------------------------------------------
     * 5) Cálculo financiero (snapshot)
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
     * 6) Persistencia (transacción)
     * -------------------------------------------------------- */
    const reserva = await prisma.$transaction(async tx => {
      const r = await ReservasCreateRepository.crearReserva(tx, {
        userId: user.id,
        espacioId: espacio.id,
        tipoEspacio: espacio.tipo,
        fechaInicio: inicio,
        fechaFin: fin,
        dias,
        estado: ReservaEstado.PENDIENTE_PAGO,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),

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
        correoEnap: data.correoEnap ?? null,
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
