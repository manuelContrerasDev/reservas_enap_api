// src/repositories/reservas/manual.repository.ts
import { Prisma } from "@prisma/client";

export const ReservasManualRepository = {
  crear(
    tx: Prisma.TransactionClient,
    data: Prisma.ReservaUncheckedCreateInput
  ) {
    return tx.reserva.create({ data });
  },
};
