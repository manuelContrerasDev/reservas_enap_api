// src/utils/fechas.ts
export function calcularDiasInclusive(fechaInicio: string, fechaFin: string): number {
  // Asumo que vienen como "YYYY-MM-DD"
  const [y1, m1, d1] = fechaInicio.split("-").map(Number);
  const [y2, m2, d2] = fechaFin.split("-").map(Number);

  const di = new Date(y1, m1 - 1, d1);
  const df = new Date(y2, m2 - 1, d2);

  const diffMs = df.getTime() - di.getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);

  // +1 si quieres que 10-10 a 11-10 sean 2 días
  return diffDias + 1;
}
