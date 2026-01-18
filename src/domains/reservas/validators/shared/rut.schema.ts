import { z } from "zod";

/* ============================================================
 * RUT Chile — validación real
 * ============================================================ */
function validarRut(rutRaw: string): boolean {
  const rut = rutRaw.replace(/\./g, "").replace("-", "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalc =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado);

  return dv === dvCalc;
}

export const rutSchema = z
  .string()
  .transform(v => v.replace(/\./g, "").replace("-", "").trim().toUpperCase())
  .refine(validarRut, { message: "RUT inválido" });
