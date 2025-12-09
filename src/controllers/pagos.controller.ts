// src/controllers/pagos.controller.ts
import { Request, Response } from "express";
import type { AuthRequest } from "../types/global";
import { prisma } from "../config/db";

import { PagosService } from "../services/PagosService";
import { Role } from "@prisma/client";

export const PagosController = {

/* ========================================================
 * 🟢 1) Crear intento de pago (Webpay)
 * ======================================================== */
  crear: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ ok: false, error: "No autenticado" });

      const { reservaId } = req.body;

      if (!reservaId)
        return res.status(400).json({ ok: false, error: "reservaId es requerido" });

      const reserva = await prisma.reserva.findUnique({
        where: { id: reservaId },
      });

      if (!reserva)
        return res.status(404).json({ ok: false, error: "Reserva no encontrada" });

      if (req.user.role === "EXTERNO") {
        return res.status(403).json({ ok: false, error: "Los invitados no pueden pagar" });
      }

      if (req.user.role === Role.SOCIO && reserva.userId !== req.user.sub) {
        return res.status(403).json({
          ok: false,
          error: "No puedes pagar reservas que no te pertenecen",
        });
      }

      const data = await PagosService.crearIntentoPago({
        reservaId,
        userId: req.user.sub,
        role: req.user.role,
      });

      return res.status(200).json({
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
        return res.status(404).json({ error: "Pago no encontrado" });

      return res.json({ ok: true, pago });

    } catch (error: any) {
      console.error("❌ [PagosController.estado]:", error);
      return res.status(400).json({ error: error.message });
    }
  },

/* ========================================================
 * 💳 3) Pagos del usuario autenticado
 * ======================================================== */
  mios: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "No autenticado" });

      const pagos = await PagosService.listarPagosUsuario(req.user.sub);

      return res.json({ ok: true, pagos });

    } catch (error: any) {
      console.error("❌ [PagosController.mios]:", error);
      return res.status(400).json({ error: error.message });
    }
  },

/* ========================================================
 * 🧾 4) Listado admin
 * ======================================================== */
  adminListado: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== Role.ADMIN)
        return res.status(403).json({ error: "No autorizado" });

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
      return res.status(400).json({ error: error.message });
    }
  },

/* ============================================================
 * 🔔 5) Webhook oficial Transbank (notificacion)
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

      if (tbkToken && !token_ws) {
        const result = await PagosService.procesarCancelacion(tbkToken);

        return res.json({
          ok: true,
          pagoId: result.pagoId,
          estado: "cancelled",
          reservaId: result.reservaId,
        });
      }

      if (!token_ws)
        return res.status(400).json({ ok: false, error: "token_ws es requerido" });

      const result = await PagosService.procesarWebpay(String(token_ws));

      const estadoFrontend =
        result.status === "APPROVED"
          ? "approved"
          : result.status === "CANCELLED"
          ? "cancelled"
          : "error";

      return res.json({
        ok: true,
        pagoId: result.pagoId,
        estado: estadoFrontend,
        reservaId: result.reservaId,
        responseCode: result.responseCode,
        message: result.message,
      });

    } catch (error: any) {
      console.error("❌ [PagosController.webhookWebpay]:", error);
      return res.status(400).json({ ok: false, error: error.message });
    }
  },

  // 🔄 6) Retorno oficial de Webpay (returnUrl)
  retornoWebpay: async (req: Request, res: Response) => {
    try {
      const token_ws = req.query.token_ws as string | undefined;
      const tbkToken = req.query.TBK_TOKEN as string | undefined;

      // Usuario canceló antes de pagar
      if (tbkToken && !token_ws) {
        return res.redirect(
          `${process.env.WEB_URL}/pago/resultado?estado=cancelled`
        );
      }

      // Error genérico
      if (!token_ws) {
        return res.redirect(
          `${process.env.WEB_URL}/pago/resultado?estado=error`
        );
      }

      const result = await PagosService.procesarWebpay(String(token_ws));

      const estado =
        result.status === "APPROVED"
          ? "approved"
          : result.status === "CANCELLED"
          ? "cancelled"
          : "rejected";

      return res.redirect(
        `${process.env.WEB_URL}/pago/resultado?estado=${estado}&pagoId=${result.pagoId}&reservaId=${result.reservaId}`
      );

    } catch (error) {
      console.error("❌ [Webpay retorno]:", error);
      return res.redirect(
        `${process.env.WEB_URL}/pago/resultado?estado=error`
      );
    }
  }


};
