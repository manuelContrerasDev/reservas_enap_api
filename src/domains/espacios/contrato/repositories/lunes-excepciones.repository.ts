// src/domains/espacios/contrato/repositories/lunes-excepciones.repository.ts
import { prisma } from "@/lib/db";

export const LunesExcepcionesRepository = {
  async getEnabledDatesISO() {
    const rows = await prisma.lunesExcepcion.findMany({
        where: { enabled: true },
        select: { fecha: true },
        orderBy: { fecha: "asc" }
    });

    return new Set(
        rows.map((r: { fecha: Date }) => r.fecha.toISOString().slice(0, 10))
    );
  }
}


