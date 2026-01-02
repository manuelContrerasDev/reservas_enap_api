import { ReservaManualRequest } from "../validators/reservas/reservaManual.schema";

export function mapReservaManualToCreateInput(
  data: ReservaManualRequest
) {
  return {
    userId: data.userId,
    espacioId: data.espacioId,
    fechaInicio: new Date(data.fechaInicio),
    fechaFin: new Date(data.fechaFin),

    cantidadAdultos: data.cantidadAdultos,
    cantidadNinos: data.cantidadNinos,
    cantidadPiscina: data.cantidadPiscina,

    usoReserva: data.usoReserva,

    nombreSocio: data.socio.nombre,
    rutSocio: data.socio.rut,
    telefonoSocio: data.socio.telefono,
    correoEnap: data.socio.correoEnap,
    correoPersonal: data.socio.correoPersonal ?? null,

    nombreResponsable: data.responsable?.nombre ?? null,
    rutResponsable: data.responsable?.rut ?? null,
    emailResponsable: data.responsable?.email ?? null,
    telefonoResponsable: data.responsable?.telefono ?? null,

    creadaPor: data.creadaPor,
  };
}
