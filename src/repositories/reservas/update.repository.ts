import { prisma } from "../../config/db";

export const ReservasUpdateRepository = {

  obtenerReserva(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      include: { invitados: true }
    });
  },

  borrarInvitados(reservaId: string) {
    return prisma.invitado.deleteMany({ where: { reservaId } });
  },

  crearInvitados(reservaId: string, invitados: any[]) {
    return prisma.invitado.createMany({
      data: invitados.map(i => ({
        reservaId,
        nombre: i.nombre,
        rut: i.rut,
        edad: i.edad ?? null,
      }))
    });
  }

};
