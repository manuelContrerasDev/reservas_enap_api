-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('TRANSFERENCIA');

-- CreateTable
CREATE TABLE "MovimientoTesoreria" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "montoClp" INTEGER NOT NULL,
    "metodo" "MetodoPago" NOT NULL DEFAULT 'TRANSFERENCIA',
    "referencia" TEXT,
    "nota" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoTesoreria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MovimientoTesoreria_reservaId_idx" ON "MovimientoTesoreria"("reservaId");

-- CreateIndex
CREATE INDEX "MovimientoTesoreria_creadoPorId_idx" ON "MovimientoTesoreria"("creadoPorId");

-- CreateIndex
CREATE INDEX "MovimientoTesoreria_createdAt_idx" ON "MovimientoTesoreria"("createdAt");

-- AddForeignKey
ALTER TABLE "MovimientoTesoreria" ADD CONSTRAINT "MovimientoTesoreria_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoTesoreria" ADD CONSTRAINT "MovimientoTesoreria_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
