// ============================================================
// mias.service.ts — ENAP 2025 (FINAL OFICIAL)
// ============================================================

import { ReservasReadRepository } from "../../repositories/reservas";

export const ReservasMiasService = {
  async ejecutar(user: any) {
    if (!user) throw new Error("NO_AUTH");

    // ✔ SOCIO, EXTERNO o ADMIN → ven solamente SUS reservas
    const userId = user.id;

    return await ReservasReadRepository.misReservas(userId);
  },
};
