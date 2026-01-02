-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailDomain" TEXT,
ADD COLUMN     "emailLocked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" SET DEFAULT 'EXTERNO';

-- CreateIndex
CREATE INDEX "User_emailDomain_idx" ON "User"("emailDomain");
