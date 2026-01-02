// ============================================================
// obtener-reserva.service.ts — ENAP 2025 (FINAL)
// ============================================================

import { ReservasReadRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";

export const ObtenerReservaService = {
  async ejecutar(reservaId: string, user: AuthUser) {
    /* --------------------------------------------------------
     * 0) Defensa básica
     * -------------------------------------------------------- */
    if (!user) {
      throw new Error("NO_AUTH");
    }

    /* --------------------------------------------------------
     * 1) Obtener reserva
     * -------------------------------------------------------- */
    const reserva = await ReservasReadRepository.detalle(reservaId);

    if (!reserva) {
      throw new Error("NOT_FOUND");
    }

    /* --------------------------------------------------------
     * 2) Autorización
     * -------------------------------------------------------- */
    if (user.role !== "ADMIN" && reserva.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    /* --------------------------------------------------------
     * 3) Retornar reserva (lectura pura)
     * -------------------------------------------------------- */
    return reserva;
  },
};
