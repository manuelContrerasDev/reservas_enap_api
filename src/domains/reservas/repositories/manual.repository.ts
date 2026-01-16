import { Prisma } from "@prisma/client";

type InvitadoInput = {
  nombre: string;
  rut: string;
  edad?: number | null;
  esPiscina?: boolean;
};

const includeManual = {
  espacio: true,
  invitados: true,
} satisfies Prisma.ReservaInclude;

export const ReservasManualRepository = {
  async crear(
    tx: Prisma.TransactionClient,
    data: Prisma.ReservaUncheckedCreateInput,
    invitados: InvitadoInput[] = []
  ) {
    const reserva = await tx.reserva.create({
      data,
      include: includeManual,
    });

    if (!invitados.length) {
      return reserva;
    }

    await tx.invitado.createMany({
      data: invitados.map((i) => ({
        reservaId: reserva.id,
        nombre: i.nombre.trim(),
        rut: i.rut.trim(),
        edad: i.edad ?? null,
        esPiscina: i.esPiscina ?? false,
      })),
    });

    return tx.reserva.findUniqueOrThrow({
      where: { id: reserva.id },
      include: includeManual,
    });
  },
};

