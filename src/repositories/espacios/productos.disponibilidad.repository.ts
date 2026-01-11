import { prisma } from "@/lib/db";
import { TipoEspacio, ReservaEstado } from "@prisma/client";

export const ProductosDisponibilidadRepository = {
  async contarOcupadasPorTipo(
    tipo: TipoEspacio,
    inicio: Date,
    fin: Date
  ) {
    const totalUnidades = await prisma.espacio.count({
      where: {
        tipo,
        activo: true,
        visible: true,
      },
    });

    const now = new Date();

    const ocupadas = await prisma.reserva.count({
      where: {
        espacio: {
          tipo,
          activo: true,
          visible: true,
        },
        OR: [
          { estado: ReservaEstado.CONFIRMADA },
          {
            estado: ReservaEstado.PENDIENTE_PAGO,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
        AND: [
          { fechaInicio: { lte: fin } },
          { fechaFin: { gte: inicio } },
        ],
      },
    });

    return { totalUnidades, ocupadas };
  },
};
