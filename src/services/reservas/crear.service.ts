// src/services/reservas/crear.service.ts

import { prisma } from "../../config/db";
import { crearReservaSchema } from "../../validators/reservas";

import { calcularTotalReserva } from "../../utils/calcularTotalReserva";

import { ReservaEstado, UsoReserva, TipoEspacio } from "@prisma/client";

import { ReservasCreateRepository } from "../../repositories/reservas";

export const CrearReservaService = {
  async ejecutar(body: any, user: any) {
    if (!user) throw new Error("NO_AUTH");

    // 1) Validación Zod
    const data = crearReservaSchema.parse(body);

    // 2) Buscar espacio
    const espacio = await prisma.espacio.findUnique({
      where: { id: data.espacioId },
    });
    if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

    // 3) Fechas
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }

    if (fechaFin <= fechaInicio) {
      throw new Error("FECHA_FIN_MENOR");
    }

    // Lunes: NO puede iniciar en lunes, pero sí terminar
    const diaInicio = fechaInicio.getDay(); // 0=Dom,1=Lun
    if (diaInicio === 1) {
      throw new Error("LUNES_NO_PERMITIDO_INICIO");
    }

    const dias = Math.ceil(
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 4) Validación días según tipo (solo CAB/QUINCHO)
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      if (dias < 3 || dias > 6) {
        throw new Error("DIAS_INVALIDOS");
      }
    }

    // 5) Capacidad piscina (100 o lo que tengas en BD)
    if (espacio.tipo === TipoEspacio.PISCINA) {
      const reservas = await prisma.reserva.findMany({
        where: {
          espacioId: espacio.id,
          fechaInicio,
          estado: { not: ReservaEstado.CANCELADA },
        },
        select: { cantidadPersonas: true },
      });

      const reservado = reservas.reduce(
        (acc, r) => acc + r.cantidadPersonas,
        0
      );

      const capacidadPiscina = espacio.capacidad ?? 100;
      const disponible = capacidadPiscina - reservado;

      if (data.cantidadPersonas > disponible) {
        throw new Error("PISCINA_SIN_CUPOS");
      }
    }

    // 6) Conflicto fechas (solo CAB/QUINCHO)
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      const conflicto = await prisma.reserva.findFirst({
        where: {
          espacioId: espacio.id,
          estado: {
            in: [
              ReservaEstado.PENDIENTE,
              ReservaEstado.PENDIENTE_PAGO,
              ReservaEstado.CONFIRMADA,
            ],
          },
          NOT: [
            { fechaFin: { lte: fechaInicio } },
            { fechaInicio: { gte: fechaFin } },
          ],
        },
      });

      if (conflicto) throw new Error("FECHAS_NO_DISPONIBLES");
    }

    // 7) Socio real (externo con autorización)
    let socioId = user.sub;

    if (user.role === "EXTERNO") {
      const relation = await prisma.guestAuthorization.findFirst({
        where: { invitadoId: user.sub },
      });
      if (!relation) throw new Error("NO_AUTORIZADO_EXTERNOS");
      socioId = relation.socioId;
    }

    // 8) Cálculo total 100% con reglas oficiales
    const { totalClp } = calcularTotalReserva({
      espacio: {
        tipo: espacio.tipo,
        tarifaClp: espacio.tarifaClp,
        tarifaExterno: espacio.tarifaExterno,
      },
      dias,
      invitados: data.invitados ?? [],
      cantidadPersonasPiscina: data.cantidadPersonasPiscina ?? 0,
      usoReserva: (data.usoReserva as UsoReserva) ?? UsoReserva.USO_PERSONAL,
    });

    // 9) Crear reserva
    const reserva = await ReservasCreateRepository.crearReserva({
      userId: socioId,
      espacioId: espacio.id,
      fechaInicio,
      fechaFin,
      dias,
      totalClp,
      estado: ReservaEstado.PENDIENTE_PAGO,
      nombreSocio: data.nombreSocio,
      rutSocio: data.rutSocio,
      telefonoSocio: data.telefonoSocio,
      correoEnap: data.correoEnap,
      correoPersonal: data.correoPersonal ?? null,
      usoReserva: data.usoReserva ?? UsoReserva.USO_PERSONAL,
      socioPresente: data.socioPresente ?? true,
      nombreResponsable: data.nombreResponsable ?? null,
      rutResponsable: data.rutResponsable ?? null,
      emailResponsable: data.emailResponsable ?? null,
      cantidadPersonas: data.cantidadPersonas,
      terminosAceptados: true,
      terminosVersion: data.terminosVersion ?? "2025-ENAP",
    });

    // 10) Crear invitados
    await ReservasCreateRepository.crearInvitados(
      reserva.id,
      data.invitados ?? []
    );

    return reserva;
  },
};
