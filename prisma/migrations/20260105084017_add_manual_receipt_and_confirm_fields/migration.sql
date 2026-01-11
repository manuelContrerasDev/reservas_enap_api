-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "comprobanteMime" TEXT,
ADD COLUMN     "comprobanteName" TEXT,
ADD COLUMN     "comprobanteSize" INTEGER,
ADD COLUMN     "comprobanteUrl" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBy" TEXT;

-- CreateIndex
CREATE INDEX "Reserva_espacioId_fechaInicio_fechaFin_idx" ON "Reserva"("espacioId", "fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "Reserva_userId_createdAt_idx" ON "Reserva"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Reserva_estado_expiresAt_idx" ON "Reserva"("estado", "expiresAt");
