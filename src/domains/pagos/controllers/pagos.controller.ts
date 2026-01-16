// ============================================================
// pagos.controller.ts — ENAP 2025 (PRODUCTION READY)
// ============================================================

import { Request, Response } from "express";
import type { AuthRequest } from "@/types/global";
import { PagosService } from "@/domains/pagos/services/PagosService";
import { prisma, } from "@/lib/db";
import { $Enums } from "@prisma/client";

export const PagosController = {

  /* ========================================================
   * 🟢 1) Crear intento de pago (Webpay)
   * ======================================================== */
  crear: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ ok: false, error: "NO_AUTH" });

      const { reservaId } = req.body;
      if (!reservaId)
        return res.status(400).json({ ok: false, error: "reservaId requerido" });

      const reserva = await prisma.reserva.findUnique({
        where: { id: reservaId },
        include: { user: true },
      });

      if (!reserva)
        return res.status(404).json({ ok: false, error: "RESERVA_NOT_FOUND" });

      // 🔐 Regla universal: SOCIO / EXTERNO / ADMIN solo paga SUS reservas
      const esAdmin = req.user.role === "ADMIN";
      if (!esAdmin && reserva.userId !== req.user.id) {
        return res.status(403).json({
          ok: false,
          error: "No puedes pagar reservas que no te pertenecen",
        });
      }


      // Crear intento de pago
      const data = await PagosService.crearIntentoPago({
        reservaId,
        userId: req.user.id,
        role: req.user.role as $Enums.Role,
      });

      return res.json({
        ok: true,
        pagoId: data.pagoId,
        checkoutUrl: data.checkoutUrl,
      });

    } catch (error: any) {
      console.error("❌ [PagosController.crear]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },

  /* ========================================================
   * 🔍 2) Obtener estado de pago
   * ======================================================== */
  estado: async (req: AuthRequest, res: Response) => {
    try {
      const pago = await PagosService.obtenerEstadoPago(req.params.id);

      if (!pago)
        return res.status(404).json({ ok: false, error: "PAGO_NOT_FOUND" });

      return res.json({ ok: true, pago });

    } catch (error: any) {
      console.error("❌ [PagosController.estado]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },

  /* ========================================================
   * 💳 3) Pagos del usuario autenticado
   * ======================================================== */
  mios: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ ok: false, error: "NO_AUTH" });

      const pagos = await PagosService.listarPagosUsuario(req.user.id);

      return res.json({ ok: true, pagos });

    } catch (error: any) {
      console.error("❌ [PagosController.mios]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },

  /* ========================================================
   * 🧾 4) Listado tesorería (admin)
   * ======================================================== */
  adminListado: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== $Enums.Role.ADMIN)
        return res.status(403).json({ ok: false, error: "NO_AUTH" });

      const filtros = {
        estado: req.query.estado?.toString(),
        desde: req.query.desde?.toString(),
        hasta: req.query.hasta?.toString(),
        espacioId: req.query.espacioId?.toString(),
      };

      const pagos = await PagosService.listarPagosAdmin(filtros);

      return res.json({ ok: true, pagos });

    } catch (error: any) {
      console.error("❌ [PagosController.adminListado]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },

  /* ============================================================
   * 🔔 5) Webhook oficial Transbank
   * ============================================================ */
  webhookWebpay: async (req: Request, res: Response) => {
    try {
      const token_ws =
        (req.body?.token_ws as string | undefined) ||
        (req.query?.token_ws as string | undefined) ||
        null;

      const tbkToken =
        (req.body?.TBK_TOKEN as string | undefined) ||
        (req.query?.TBK_TOKEN as string | undefined) ||
        null;

      // 🟥 CANCELACIÓN desde Webpay (TBK_TOKEN)
      if (tbkToken && !token_ws) {
        return res.json({
          ok: true,
          estado: "cancelled",
          message: "Pago cancelado por el usuario en Webpay",
        });
      }

      if (!token_ws)
        return res.status(400).json({ ok: false, error: "token_ws requerido" });

      const result = await PagosService.procesarWebpay(String(token_ws));

      return res.json({
        ok: true,
        pagoId: result.pagoId,
        reservaId: result.reservaId,
        estado: result.status,
        responseCode: result.responseCode,
        message: result.message,
      });

    } catch (error: any) {
      console.error("❌ [PagosController.webhookWebpay]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },

  /* ============================================================
   * 🔄 6) Return URL oficial → redirección al frontend
   * ============================================================ */
  retornoWebpay: async (req: Request, res: Response) => {
    try {
      const token_ws = req.query.token_ws as string | undefined;
      const tbkToken = req.query.TBK_TOKEN as string | undefined;

      if (tbkToken && !token_ws) {
        return res.redirect(`${process.env.WEB_URL}/pago/resultado?estado=cancelled`);
      }

      if (!token_ws) {
        return res.redirect(`${process.env.WEB_URL}/pago/resultado?estado=error`);
      }

      const result = await PagosService.procesarWebpay(String(token_ws));

      return res.redirect(
        `${process.env.WEB_URL}/pago/resultado?estado=${result.status}&pagoId=${result.pagoId}&reservaId=${result.reservaId}`
      );

    } catch (error) {
      console.error("❌ [Webpay retorno]:", error);
      return res.redirect(`${process.env.WEB_URL}/pago/resultado?estado=error`);
    }
  },
};
