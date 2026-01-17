// ============================================================
// ReservaManualService — ENAP 2025 (ADMIN · MANUAL)
// ============================================================

import { prisma } from "@/lib/db";
import {
  ReservaEstado,
  TipoEspacio,
  Role,
} from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

import { calcularReserva } from "@/domains/reservas/utils/calcularReserva";
import { ReservasManualRepository } from "../../repositories/manual.repository";
import { mapReservaManualToCreateInput } from "../../mappers/reservaManual.mapper";
import type { ReservaManualRequest } from "../../validators/reservaManual.schema";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRES_IN_MS = DAY_MS;

const SYSTEM_MANUAL_USER_ID = process.env.SYSTEM_MANUAL_USER_ID;

export const ReservaManualAdminService = {
  async crear(data: ReservaManualRequest, adminId: string) {
    /* =========================================================
     * Guard rails
     * ========================================================= */
    if (!SYSTEM_MANUAL_USER_ID) {
      throw new Error("SYSTEM_USER_NO_CONFIGURADO");
    }

    if (!adminId) {
      throw new Error("ADMIN_ID_REQUERIDO");
    }

    if (data.cantidadAdultos < 1) {
      throw new Error("DEBE_HABER_AL_MENOS_1_ADULTO");
    }

    /* =========================================================
     * Fechas
     * ========================================================= */
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (fin <= inicio) throw new Error("FECHA_FIN_INVALIDA");
    if (inicio.getDay() === 1) throw new Error("INICIO_LUNES_NO_PERMITIDO");

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    /* =========================================================
     * Espacio
     * ========================================================= */
    const espacio = await prisma.espacio.findUnique({
      where: { id: data.espacioId },
    });
    if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

    if (espacio.tipo !== TipoEspacio.PISCINA) {
      if (dias < 3 || dias > 6) throw new Error("DIAS_INVALIDOS");
    }

    /* =========================================================
     * Capacidad
     * ========================================================= */
    const totalPersonas = data.cantidadAdultos + data.cantidadNinos;

    if (data.cantidadPiscina > totalPersonas) {
      throw new Error("CANTIDAD_PISCINA_INVALIDA");
    }

    if (espacio.tipo === TipoEspacio.CABANA && totalPersonas > 6) {
      throw new Error("CAPACIDAD_CABANA_SUPERADA");
    }

    if (espacio.tipo === TipoEspacio.QUINCHO) {
      const max = data.tipoCliente === "SOCIO" ? 15 : 10;
      if (totalPersonas > max) {
        throw new Error("CAPACIDAD_QUINCHO_SUPERADA");
      }
    }

    /* =========================================================
     * Invitados vs cantidades
     * ========================================================= */
    if (Array.isArray(data.invitados) && data.invitados.length > 0) {
      const adultosInv = data.invitados.filter(
        (i) => (i.edad ?? 18) >= 12
      ).length;

      const ninosInv = data.invitados.filter(
        (i) => (i.edad ?? 0) < 12
      ).length;

      const piscinaInv = data.invitados.filter((i) => i.esPiscina).length;

      if (
        adultosInv > data.cantidadAdultos ||
        ninosInv > data.cantidadNinos ||
        piscinaInv > data.cantidadPiscina
      ) {
        throw new Error("INVITADOS_SUPERAN_DECLARADO");
      }
    }

    /* =========================================================
     * Disponibilidad
     * ========================================================= */
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      const conflicto = await prisma.reserva.findFirst({
        where: {
          espacioId: data.espacioId,
          estado: {
            in: [
              ReservaEstado.PENDIENTE_PAGO,
              ReservaEstado.CONFIRMADA,
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

    /* =========================================================
     * Cálculo financiero (FUENTE DE VERDAD)
     * ========================================================= */
    const role: Role =
      data.tipoCliente === "SOCIO" ? Role.SOCIO : Role.EXTERNO;

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
      cantidadAdultos: data.cantidadAdultos,
      cantidadNinos: data.cantidadNinos,
      cantidadPiscina: data.cantidadPiscina,
      usoReserva: data.usoReserva,
      role,
    });

    const expiresAt = new Date(Date.now() + EXPIRES_IN_MS);

    /* =========================================================
     * Persistencia + Audit
     * ========================================================= */
    return prisma.$transaction(async (tx) => {
      const reserva = await ReservasManualRepository.crear(
        tx,
        {
          ...mapReservaManualToCreateInput(data),

          // CONTRATO PRISMA 
          tipoEspacio: espacio.tipo,

          userId: SYSTEM_MANUAL_USER_ID,
          creadaPor: adminId,

          dias,
          estado: ReservaEstado.PENDIENTE_PAGO,
          expiresAt,

          precioBaseSnapshot: precios.precioBaseSnapshot,
          precioPersonaSnapshot: precios.precioPersonaSnapshot,
          precioPiscinaSnapshot: precios.precioPiscinaSnapshot,
          totalClp: precios.totalClp,

          terminosAceptados: true,
          terminosVersion: "2026-ENAP",
        },
        data.invitados
      );

      await tx.auditLog.create({
        data: {
          action: "RESERVA_MANUAL_CREADA",
          entity: "RESERVA",
          entityId: reserva.id,
          userId: adminId,
          details: {
            tipoCliente: data.tipoCliente,
            totalClp: precios.totalClp,
            expiresAt,
          },
        },
      });

      return reserva;
    });
  },
};
