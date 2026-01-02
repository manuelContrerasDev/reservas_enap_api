/*
  Warnings:

  - You are about to drop the column `precioPersonaExterno` on the `Espacio` table. All the data in the column will be lost.
  - You are about to drop the column `precioPersonaSocio` on the `Espacio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Espacio" DROP COLUMN "precioPersonaExterno",
DROP COLUMN "precioPersonaSocio",
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "precioPersonaAdicionalExterno" INTEGER NOT NULL DEFAULT 4500,
ADD COLUMN     "precioPersonaAdicionalSocio" INTEGER NOT NULL DEFAULT 3500,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Espacio_visible_idx" ON "Espacio"("visible");
