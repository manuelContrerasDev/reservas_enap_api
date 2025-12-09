// src/controllers/guestAuthorization.controller.ts
import { Response } from "express";
import { prisma } from "../config/db";

import type { AuthRequest } from "../types/global";
import {
  createGuestAuthSchema,
  deleteGuestAuthSchema,
} from "../validators/guestAuth.schema";
import { Role } from "@prisma/client";

export const GuestAuthController = {

  /* ============================================================
   * 🟢 SOCIO AUTORIZA A UN INVITADO
   * POST /api/guest
   * ============================================================ */
  crear: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== Role.SOCIO) {
        return res.status(403).json({
          ok: false,
          error: "Solo los usuarios SOCIO pueden autorizar invitados",
        });
      }

      const data = createGuestAuthSchema.parse(req.body);

      // Buscar invitado por email
      let invitado = await prisma.user.findUnique({
        where: { email: data.email },
      });

      // Crear como INVITADO si no existe
      if (!invitado) {
        invitado = await prisma.user.create({
          data: {
            email: data.email,
            name: data.name ?? null,
            passwordHash: "***INVITADO***",
            role: Role.EXTERNO,
          },
        });
      }

      // Validar si ya estaba autorizado
      const exists = await prisma.guestAuthorization.findFirst({
        where: { socioId: req.user.sub, invitadoId: invitado.id },
      });

      if (exists) {
        return res.json({
          ok: true,
          message: "El invitado ya está autorizado",
          invitado,
        });
      }

      // Crear relación
      const auth = await prisma.guestAuthorization.create({
        data: {
          socioId: req.user.sub,
          invitadoId: invitado.id,
        },
      });

      return res.status(201).json({
        ok: true,
        message: "Invitado autorizado correctamente",
        autorizacion: auth,
        invitado,
      });

    } catch (error: any) {
      console.error("❌ [GuestAuthorization.crear]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },

  /* ============================================================
   * 📋 LISTAR INVITADOS DEL SOCIO
   * GET /api/guest/mios
   * ============================================================ */
  mios: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== Role.SOCIO) {
        return res.status(403).json({
          ok: false,
          error: "Solo SOCIO puede listar sus invitados",
        });
      }

      const autorizaciones = await prisma.guestAuthorization.findMany({
        where: { socioId: req.user.sub },
        include: {
          invitado: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        ok: true,
        data: autorizaciones,
      });

    } catch (error) {
      console.error("❌ [GuestAuthorization.mios]:", error);
      return res.status(500).json({ ok: false, error: "Error al listar invitados" });
    }
  },

  /* ============================================================
   * ❌ REVOCAR AUTORIZACIÓN
   * DELETE /api/guest/:id
   * ============================================================ */
  eliminar: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== Role.SOCIO) {
        return res.status(403).json({
          ok: false,
          error: "Solo SOCIO puede eliminar autorizaciones",
        });
      }

      const { id } = deleteGuestAuthSchema.parse(req.params);

      const auth = await prisma.guestAuthorization.findUnique({ where: { id } });

      if (!auth) {
        return res.status(404).json({
          ok: false,
          error: "Autorización no encontrada",
        });
      }

      if (auth.socioId !== req.user.sub) {
        return res.status(403).json({
          ok: false,
          error: "No puedes eliminar autorizaciones de otros socios",
        });
      }

      await prisma.guestAuthorization.delete({ where: { id } });

      return res.json({
        ok: true,
        message: "Invitado revocado correctamente",
        deletedId: id,
      });

    } catch (error: any) {
      console.error("❌ [GuestAuthorization.eliminar]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },
};
