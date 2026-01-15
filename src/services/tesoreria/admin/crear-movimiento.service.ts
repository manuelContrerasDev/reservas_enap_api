import { prisma } from "@/lib/db";
import type { AuthUser } from "@/types/global";
import { createAuditLogService } from "@/services/audit/audit-log.service";

export async function crearMovimientoTesoreriaService(
  admin: AuthUser,
  payload: {
    reservaId: string;
    montoClp: number;
    referencia?: string;
    nota?: string;
  }
) {
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("NO_AUTORIZADO_ADMIN");
  }

  const movimiento = await prisma.movimientoTesoreria.create({
    data: {
      montoClp: payload.montoClp,
      referencia: payload.referencia,
      nota: payload.nota,
      reservaId: payload.reservaId,
      creadoPorId: admin.id,
    },
  });

  await createAuditLogService({
    action: "CREAR_MOVIMIENTO_TESORERIA",
    entity: "MOVIMIENTO_TESORERIA",
    entityId: movimiento.id,
    actor: admin,
    details: {
      reservaId: payload.reservaId,
      montoClp: payload.montoClp,
      referencia: payload.referencia,
    },
    after: movimiento,
  });

  return movimiento;
}
