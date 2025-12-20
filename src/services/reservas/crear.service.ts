// ============================================================
// crear.service.ts — ENAP 2025 (FINAL SINCRONIZADO)
// ============================================================

import { prisma } from "../../lib/db";
import { crearReservaSchema } from "../../validators/reservas";
import { ReservaEstado, Role, TipoEspacio } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { calcularReserva } from "../../utils/calcularReserva";
import { ReservasCreateRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";



const MAX_CABANA = 6;
const MAX_QUINCHO_SOCIO = 15;
const MAX_QUINCHO_EXTERNO = 10;

export const CrearReservaService = {
  async ejecutar(body: unknown, user: AuthUser){
    if (!user) throw new Error("NO_AUTH");

    // 1) Validación Zod
    const data = crearReservaSchema.parse(body);

    // 2) Obtener espacio
    const espacio = await prisma.espacio.findUnique({
      where: { id: data.espacioId },
    });
    if (!espacio) throw new Error("ESPACIO_NOT_FOUND");

    // 3) Validaciones de fecha
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new Error("FECHAS_INVALIDAS");
    }
    if (fin <= inicio) throw new Error("FECHA_FIN_MENOR");
    if (inicio.getDay() === 1) throw new Error("INICIO_LUNES_NO_PERMITIDO");

    const dias = differenceInCalendarDays(fin, inicio) + 1;

    // Días válidos cabaña/quincho
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      if (dias < 3 || dias > 6) throw new Error("DIAS_INVALIDOS");
    }

    // 4) Disponibilidad (NO aplica piscina)
    if (espacio.tipo !== TipoEspacio.PISCINA) {
      const choque = await prisma.reserva.findFirst({
        where: {
          espacioId: espacio.id,
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
      if (choque) throw new Error("FECHAS_NO_DISPONIBLES");
    }

    // 5) Normalizar invitados
    const invitados = (data.invitados ?? []).map(i => ({
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

    // 🔥 NUEVO — derivar cantidadPiscina desde invitados
    const cantidadPiscina = invitados.filter(i => i.esPiscina === true).length;

    // 6) Capacidad según tipo
    if (espacio.tipo === TipoEspacio.CABANA) {
      if (cantidadAdultos + cantidadNinos > 6) {
        throw new Error("CAPACIDAD_CABANA_SUPERADA");
      }
    }

    if (espacio.tipo === TipoEspacio.QUINCHO) {
      const max = user.role === Role.SOCIO ? 15 : 10;
      if (cantidadAdultos + cantidadNinos > max) {
        throw new Error("CAPACIDAD_QUINCHO_SUPERADA");
      }
    }

    // 7) SOCIO / EXTERNO
    const userId = user.id;
    const role = user.role;

    // 8) Cálculo financiero (CON cantidadPiscina derivado)
    const precios = calcularReserva({
      espacio,
      dias,
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,
      usoReserva: data.usoReserva,
      role,
    });

    // 9) Crear reserva
    const reserva = await ReservasCreateRepository.crearReserva({
      userId,
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

    // 10) Crear invitados
    await ReservasCreateRepository.crearInvitados(reserva.id, invitados);

    return reserva;
  },
};
