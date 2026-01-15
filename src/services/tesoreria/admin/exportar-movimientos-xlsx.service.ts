// src/services/tesoreria/admin/exportar-movimientos-xlsx.service.ts
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import type { AuthUser } from "@/types/global";
import { Prisma } from "@prisma/client";

interface FiltrosTesoreria {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}

function parseDateOnlyOrThrow(input?: string): Date | undefined {
  if (!input) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) throw new Error("FECHA_INVALIDA");

  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("FECHA_INVALIDA");
  return d;
}

export async function exportarMovimientosXlsxService(
  admin: AuthUser,
  filtros: FiltrosTesoreria
): Promise<Buffer> {
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("NO_AUTORIZADO_ADMIN");
  }

  const desde = parseDateOnlyOrThrow(filtros.desde);
  const hasta = parseDateOnlyOrThrow(filtros.hasta);

  if (desde && hasta && desde.getTime() > hasta.getTime()) {
    throw new Error("RANGO_INVALIDO");
  }

  /* ============================================================
   * 🔎 Filtros Prisma
   * ============================================================ */
  const where: Prisma.MovimientoTesoreriaWhereInput = {};

  if (desde || hasta) {
    where.createdAt = {};
    if (desde) (where.createdAt as Prisma.DateTimeFilter).gte = desde;

    if (hasta) {
      const end = new Date(hasta);
      end.setUTCHours(23, 59, 59, 999);
      (where.createdAt as Prisma.DateTimeFilter).lte = end;
    }
  }

  const movimientos = await prisma.movimientoTesoreria.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      montoClp: true,
      referencia: true,
      nota: true,
      reserva: {
        select: {
          id: true,
          nombreSocio: true,
          espacio: { select: { nombre: true } },
        },
      },
      creadoPor: { select: { name: true, email: true } },
    },
  });

  /* ============================================================
   * 📊 Excel
   * ============================================================ */
  const wb = new ExcelJS.Workbook();
  wb.creator = "Reservas ENAP";
  wb.created = new Date();

  const ws = wb.addWorksheet("Tesorería", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Fecha", key: "fecha", width: 20 },
    { header: "Reserva ID", key: "reservaId", width: 36 },
    { header: "Socio", key: "socio", width: 28 },
    { header: "Espacio", key: "espacio", width: 22 },
    { header: "Monto CLP", key: "monto", width: 14 },
    { header: "Referencia", key: "referencia", width: 24 },
    { header: "Nota", key: "nota", width: 26 },
    { header: "Admin", key: "admin", width: 26 },
  ];

  for (const m of movimientos) {
    ws.addRow({
      fecha: m.createdAt,
      reservaId: m.reserva.id,
      socio: m.reserva.nombreSocio,
      espacio: m.reserva.espacio.nombre,
      monto: m.montoClp,
      referencia: m.referencia ?? "",
      nota: m.nota ?? "",
      admin: m.creadoPor.name ?? m.creadoPor.email,
    });
  }

  // Header
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: "middle" };
  header.height = 18;

  ws.getColumn("monto").numFmt = "#,##0";
  ws.getColumn("fecha").numFmt = "dd-mm-yyyy hh:mm";

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: ws.columns.length },
  };

  /* ============================================================
   * 🔒 AuditLog — EXPORT TESORERÍA (D3.2)
   * ============================================================ */
  const auditDetails: Prisma.InputJsonValue = {
    formato: "XLSX",
    filtros: {
      desde: filtros.desde ?? null,
      hasta: filtros.hasta ?? null,
    },
    totalRegistros: movimientos.length,
  };

  await prisma.auditLog.create({
    data: {
      action: "EXPORT_TESORERIA",
      entity: "TESORERIA",
      entityId: "MOVIMIENTOS",
      userId: admin.id,
      details: auditDetails,
    },
  });

  /* ============================================================
   * 📦 Resultado
   * ============================================================ */
  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer as ArrayBuffer);
}
