// ============================================================
// crear-manual.controller.ts — ENAP 2025 (FINAL SINCRONIZADO)
// ============================================================

import { Response } from "express";
import type { AuthRequest } from "../../../types/global";
import { prisma } from "../../../lib/db";
import { calcularReserva } from "../../../utils/calcularReserva";
import { reservaManualSchema } from "../../../validators/reservas/reservaManual.schema";
import { Role } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

export const crearReservaManualAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ ok: false, error: "NO_AUTH" });
    }

    // Validación Zod
    const parsed = reservaManualSchema.parse(req.body);

    const {
      userId,
      espacioId,
      fechaInicio,
      fechaFin,
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,
      marcarPagada,
      usoReserva,
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
    } = parsed;

    // Validar espacio
    const espacio = await prisma.espacio.findUnique({ where: { id: espacioId } });
    if (!espacio) {
      return res.status(404).json({ ok: false, error: "ESPACIO_NOT_FOUND" });
    }

    // Obtener o crear usuario
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: nombreSocio,
          rut: rutSocio,
          email: correoEnap ?? correoPersonal ?? "",
          role: Role.SOCIO,
          passwordHash: "", // requerido por Prisma, aunque no se usará login
          emailConfirmed: false,
        },
      });
    }

    // Cálculo de días
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = differenceInCalendarDays(fin, inicio) + 1;

    if (inicio.getDay() === 1) {
      return res.status(400).json({ ok: false, error: "INICIO_LUNES_NO_PERMITIDO" });
    }

    if (dias < 3 || dias > 6) {
      return res.status(400).json({ ok: false, error: "RANGO_DIAS_INVALIDO" });
    }

    // Calcular valores financieros
    const precios = calcularReserva({
      espacio,
      dias,
      cantidadAdultos,
      cantidadNinos,
      cantidadPiscina,
      usoReserva,
      role: user.role,
    });

    // Crear reserva
    const reserva = await prisma.reserva.create({
      data: {
        userId: user.id,
        espacioId,
        fechaInicio: inicio,
        fechaFin: fin,
        dias,
        usoReserva,
        estado: marcarPagada ? "CONFIRMADA" : "PENDIENTE_PAGO",
        cantidadAdultos,
        cantidadNinos,
        cantidadPiscina,
        precioBaseSnapshot: precios.precioBaseSnapshot,
        precioPersonaSnapshot: precios.precioPersonaSnapshot,
        precioPiscinaSnapshot: precios.precioPiscinaSnapshot,
        totalClp: precios.totalClp,
        creadaPor,

        // Datos de socio
        nombreSocio,
        rutSocio,
        telefonoSocio,
        correoEnap,
        correoPersonal: correoPersonal ?? null,

        // Responsable
        nombreResponsable: nombreResponsable ?? null,
        rutResponsable: rutResponsable ?? null,
        emailResponsable: emailResponsable ?? null,
        telefonoResponsable: telefonoResponsable ?? null,
      },
    });

    return res.json({ ok: true, data: reserva });

  } catch (error: any) {
    console.error("❌ [Admin crear manual]:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};
