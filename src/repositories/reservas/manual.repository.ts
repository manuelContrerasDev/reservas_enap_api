import { Prisma } from "@prisma/client";

type InvitadoInput = {
  nombre: string;
  rut: string;
  edad?: number | null;
  esPiscina?: boolean;
};

const manualInclude = {
  espacio: true,
  invitados: true,
  pago: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ReservaInclude;

export const ReservasManualRepository = {
  async crear(
    tx: Prisma.TransactionClient,
    data: Prisma.ReservaUncheckedCreateInput,
    invitados?: InvitadoInput[]
  ) {
    const reserva = await tx.reserva.create({
      data,
      include: manualInclude,
    });

    if (Array.isArray(invitados) && invitados.length > 0) {
      await tx.invitado.createMany({
        data: invitados.map((i) => ({
          reservaId: reserva.id,
          nombre: i.nombre.trim(),
          rut: i.rut.trim(),
          edad: i.edad ?? null,
          esPiscina: i.esPiscina ?? false,
        })),
      });

      // re-fetch para incluir invitados creados
      return tx.reserva.findUniqueOrThrow({
        where: { id: reserva.id },
        include: manualInclude,
      });
    }

    return reserva;
  },
};
