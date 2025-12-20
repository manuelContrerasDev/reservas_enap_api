// ============================================================
// obtener.service.ts — ENAP 2025 (FINAL + SECURITY FIX)
// ============================================================

import { ReservasReadRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";

export const ObtenerReservaService = {
  async ejecutar(id: string, user?: AuthUser) {
    // ---------------------------------------------------------
    // 0) Auth
    // ---------------------------------------------------------
    if (!user) {
      throw new Error("NO_AUTH");
    }

    // ---------------------------------------------------------
    // 1) Validar ID
    // ---------------------------------------------------------
    if (!id || typeof id !== "string") {
      throw new Error("ID_REQUERIDO");
    }

    const reservaId = id.trim();

    // ---------------------------------------------------------
    // 2) Obtener detalle (repo)
    // ---------------------------------------------------------
    const reserva = await ReservasReadRepository.detalle(reservaId);

    if (!reserva) {
      throw new Error("RESERVA_NO_ENCONTRADA");
    }

    // ---------------------------------------------------------
    // 3) Seguridad por rol
    // ---------------------------------------------------------
    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    // ---------------------------------------------------------
    // 4) Retornar
    // ---------------------------------------------------------
    return reserva;
  },
};
