// ============================================================
// disponibilidad-piscina.service.ts — ENAP 2025 (VERSIÓN FINAL)
// ============================================================

import { PiscinaRepository } from "../../repositories/reservas";

export const DisponibilidadPiscinaService = {
  async ejecutar(fechaISO: string) {
    /* --------------------------------------------------------
     * 1) Validar parámetro
     * -------------------------------------------------------- */
    if (!fechaISO) throw new Error("FECHA_REQUERIDA");

    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) throw new Error("FECHA_INVALIDA");

    // 🔥 Normalizar fecha (evita desfase por zona horaria)
    fecha.setHours(0, 0, 0, 0);

    /* --------------------------------------------------------
     * 2) Obtener reservas del día
     * -------------------------------------------------------- */
    const reservas = await PiscinaRepository.reservasPorFecha(fecha);

    /* --------------------------------------------------------
     * 3) Obtener capacidad real del espacio piscina
     * -------------------------------------------------------- */
    const espacioPiscina = await PiscinaRepository.obtenerEspacioPiscina();
    if (!espacioPiscina) {
      throw new Error("ESPACIO_PISCINA_NO_CONFIGURADO");
    }

    const capacidadMax = espacioPiscina.capacidad ?? 80; // fallback seguro

    /* --------------------------------------------------------
     * 4) Sumar cantidadPiscina oficial (ENAP 2025)
     * -------------------------------------------------------- */
    const reservado = reservas.reduce(
      (acc, r) => acc + (r.cantidadPiscina ?? 0),
      0
    );

    const disponible = Math.max(0, capacidadMax - reservado);

    /* --------------------------------------------------------
     * 5) Respuesta oficial
     * -------------------------------------------------------- */
    return {
      fecha: fechaISO,
      capacidadMax,
      reservado,
      disponible,
    };
  },
};
