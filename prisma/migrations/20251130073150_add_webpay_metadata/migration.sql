-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "accountingDate" TEXT,
ADD COLUMN     "buyOrder" TEXT,
ADD COLUMN     "installmentsNumber" INTEGER,
ADD COLUMN     "paymentTypeCode" TEXT,
ADD COLUMN     "rawResponse" JSONB,
ADD COLUMN     "responseCode" INTEGER,
ADD COLUMN     "responseMessage" TEXT,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "transactionDate" TEXT;

-- CreateIndex
CREATE INDEX "Pago_status_idx" ON "Pago"("status");

-- CreateIndex
CREATE INDEX "Pago_token_idx" ON "Pago"("token");

-- CreateIndex
CREATE INDEX "Pago_buyOrder_idx" ON "Pago"("buyOrder");

-- CreateIndex
CREATE INDEX "Pago_createdAt_idx" ON "Pago"("createdAt");
