// src/mappers/reservaManual.mapper.ts

import type { ReservaManualRequest } from
  "../../../validators/reservas/reservaManual.schema";

/**
 * Mapper puro de dominio
 * ❌ No setea estado
 * ❌ No setea userId
 * ❌ No setea expiresAt
 * ❌ No persiste tipoCliente (concepto UI)
 */
export function mapReservaManualToCreateInput(
  data: ReservaManualRequest
) {
  return {
    espacioId: data.espacioId,

    fechaInicio: new Date(data.fechaInicio),
    fechaFin: new Date(data.fechaFin),

    cantidadAdultos: data.cantidadAdultos,
    cantidadNinos: data.cantidadNinos,
    cantidadPiscina: data.cantidadPiscina,

    usoReserva: data.usoReserva,

    // ======================
    // SOCIO
    // ======================
    nombreSocio: data.socio.nombre,
    rutSocio: data.socio.rut,
    telefonoSocio: data.socio.telefono,
    correoEnap: data.socio.correoEnap,
    correoPersonal: data.socio.correoPersonal ?? null,

    // ======================
    // RESPONSABLE (opcional)
    // ======================
    nombreResponsable: data.responsable?.nombre ?? null,
    rutResponsable: data.responsable?.rut ?? null,
    emailResponsable: data.responsable?.email ?? null,
    telefonoResponsable: data.responsable?.telefono ?? null,
  };
}
