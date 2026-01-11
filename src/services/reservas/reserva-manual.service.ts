import { prisma } from "../../lib/db";
import { ReservaEstado, TipoEspacio, Role } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

import { calcularReserva } from "../../utils/calcularReserva";
import { ReservasManualRepository } from "../../repositories/reservas/manual.repository";
import type { ReservaManualRequest } from "../../validators/reservas/reservaManual.schema";
import { mapReservaManualToCreateInput } from "../../mappers/reservaManual.mapper";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRES_IN_MS = DAY_MS;

type InvitadoLimpio = {
  nombre: string;
  rut: string;
  edad: number | null;
  esPiscina: boolean;
};

function limpiarInvitados(raw?: ReservaManualRequest["invitados"]): InvitadoLimpio[] {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((i) => {
    const nombre = String(i.nombre ?? "").trim();
    const rut = String(i.rut ?? "").trim();
    const edad =
      i.edad === undefined || i.edad === null ? null : Number(i.edad);
    const esPiscina = Boolean(i.esPiscina ?? false);

    if (!nombre || !rut) throw new Error("INVITADOS_INVALIDOS");

    if (edad != null) {
      if (!Number.isInteger(edad) || Number.isNaN(edad) || edad < 0) {
        throw new Error("INVITADOS_INVALIDOS");
      }
    }

    return { nombre, rut, edad, esPiscina };
  });
}

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
    } = data;

    /* --------------------------------------------------------
     * 0) Guard rails mínimos
     * -------------------------------------------------------- */
    if (!userId) throw new Error("USER_ID_REQUERIDO");
    if (!espacioId) throw new Error("ESPACIO_ID_REQUERIDO");
    if (!creadaPor) throw new Error("ADMIN_ID_REQUERIDO");

    const adultos = Math.max(0, Number(cantidadAdultos));
    const ninos = Math.max(0, Number(cantidadNinos));
    const piscina = Math.max(0, Number(cantidadPiscina));

    if (adultos < 1) throw new Error("DEBE_HABER_AL_MENOS_1_ADULTO");

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

    // Normalización día completo
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (fin <= inicio) throw new Error("FECHA_FIN_INVALIDA");

    // Lunes mantenimiento (getDay: 1 = lunes)
    if (inicio.getDay() === 1) throw new Error("INICIO_LUNES_NO_PERMITIDO");

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    if (espacio.tipo !== TipoEspacio.PISCINA) {
      if (dias < 3 || dias > 6) throw new Error("DIAS_INVALIDOS");
    }

    /* --------------------------------------------------------
     * 3) Invitados (opcional) y consistencia con cantidades declaradas
     * -------------------------------------------------------- */
    const invitadosLimpios = limpiarInvitados(data.invitados);

    if (invitadosLimpios.length > 0) {
      const adultosInv = invitadosLimpios.filter((x) => (x.edad ?? 0) >= 12).length;
      const ninosInv = invitadosLimpios.filter((x) => (x.edad ?? 0) < 12).length;
      const piscinaInv = invitadosLimpios.filter((x) => x.esPiscina).length;

      // Regla pro: listado no puede exceder lo declarado
      if (adultosInv > adultos || ninosInv > ninos || piscinaInv > piscina) {
        throw new Error("INVITADOS_SUPERAN_DECLARADO");
      }
    }

    /* --------------------------------------------------------
     * 4) Capacidad (usa cantidades declaradas, no listado)
     * -------------------------------------------------------- */
    const totalPersonas = adultos + ninos;

    if (espacio.tipo === TipoEspacio.CABANA && totalPersonas > 6) {
      throw new Error("CAPACIDAD_CABANA_SUPERADA");
    }

    if (espacio.tipo === TipoEspacio.QUINCHO) {
      const max = user.role === Role.SOCIO ? 15 : 10;
      if (totalPersonas > max) throw new Error("CAPACIDAD_QUINCHO_SUPERADA");
    }

    /* --------------------------------------------------------
     * 5) Disponibilidad (NO piscina)
     * -------------------------------------------------------- */
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      const conflicto = await prisma.reserva.findFirst({
        where: {
          espacioId,
          estado: { in: [ReservaEstado.PENDIENTE_PAGO, ReservaEstado.CONFIRMADA] },
          NOT: {
            OR: [{ fechaFin: { lte: inicio } }, { fechaInicio: { gte: fin } }],
          },
        },
        select: { id: true },
      });

      if (conflicto) throw new Error("FECHAS_NO_DISPONIBLES");
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

        precioPersonaAdicionalSocio: espacio.precioPersonaAdicionalSocio,
        precioPersonaAdicionalExterno: espacio.precioPersonaAdicionalExterno,

        precioPiscinaSocio: espacio.precioPiscinaSocio,
        precioPiscinaExterno: espacio.precioPiscinaExterno,
      },
      dias,
      cantidadAdultos: adultos,
      cantidadNinos: ninos,
      cantidadPiscina: piscina,
      usoReserva,
      role: user.role,
    });

    /* --------------------------------------------------------
     * 7) Persistencia (reserva normal: estado + expiresAt + snapshots)
     * -------------------------------------------------------- */
    const expiresAt = marcarPagada ? null : new Date(Date.now() + EXPIRES_IN_MS);

    const createData = {
      ...mapReservaManualToCreateInput(data),

      dias,

      estado: marcarPagada ? ReservaEstado.CONFIRMADA : ReservaEstado.PENDIENTE_PAGO,
      expiresAt,

      precioBaseSnapshot: precios.precioBaseSnapshot,
      precioPersonaSnapshot: precios.precioPersonaSnapshot,
      precioPiscinaSnapshot: precios.precioPiscinaSnapshot,
      totalClp: precios.totalClp,

      terminosAceptados: true,
      terminosVersion: "2025-ENAP",

      // Si el admin marca confirmada, dejamos rastro coherente:
      ...(marcarPagada
        ? { cancelledAt: null, cancelledBy: null }
        : {}),
    };

    return prisma.$transaction(async (tx) => {
      const reserva = await ReservasManualRepository.crear(
        tx,
        createData,
        invitadosLimpios
      );

      // ✅ AuditLog (consistente y pro)
      await tx.auditLog.create({
        data: {
          action: "RESERVA_MANUAL_CREADA",
          entity: "Reserva",
          entityId: reserva.id,
          userId: creadaPor,
          details: {
            userId,
            espacioId,
            estado: reserva.estado,
            marcarPagada,
            expiresAt,
          },
        },
      });

      return reserva;
    });
  },
};
