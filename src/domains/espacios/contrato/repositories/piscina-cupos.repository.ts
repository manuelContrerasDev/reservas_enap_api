// src/domains/espacios/contrato/repositories/piscina-cupos.repository.ts
import { prisma } from "@/lib/db";
import { ReservaEstado } from "@prisma/client";

export const PiscinaCuposRepository = {
  async contarPersonasPiscinaEnDia(diaInicio: Date, diaFin: Date) {
    const now = new Date();

    const reservas = await prisma.reserva.findMany({
    where: {
        tipoEspacio: "PISCINA",
        OR: [
        // Bloquea : Reservas CONFIRMADAS
        { estado: ReservaEstado.CONFIRMADA },

        // Bloquea : Reservas PENDIENTE_VALIDACION
        { estado: ReservaEstado.PENDIENTE_VALIDACION },

        // Bloquea : Reservas PENDIENTE_PAGO
        {
            estado: ReservaEstado.PENDIENTE_PAGO,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        ],
        AND: [
        { fechaInicio: { lte: diaFin } },
        { fechaFin: { gte: diaInicio } },
        ],
    },
    select: {
        cantidadPiscina: true,
        invitados: {
        select: { esPiscina: true },
        },
    },
    });

    // Preferimos invitados si existen; fallback a cantidadPiscina
    let total = 0;

    for (const r of reservas) {
    const invitadosPiscina =
        r.invitados?.filter((i: { esPiscina: boolean }) => i.esPiscina).length ?? 0;

    total += invitadosPiscina > 0
        ? invitadosPiscina
        : (r.cantidadPiscina ?? 0);
    }
    return total;
  },
};
