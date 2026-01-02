// ============================================================
// mias.service.ts — ENAP 2025 (FINAL)
// ============================================================

import { ReservasReadRepository } from "../../repositories/reservas";
import type { AuthUser } from "../../types/global";

export const ReservasMiasService = {
  async ejecutar(user: AuthUser) {
    if (!user?.id) throw new Error("NO_AUTH");

    return ReservasReadRepository.misReservas(user.id);
  },
};
