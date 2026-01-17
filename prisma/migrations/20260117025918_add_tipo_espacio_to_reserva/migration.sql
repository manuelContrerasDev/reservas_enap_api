/*
  Warnings:

  - Added the required column `tipoEspacio` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_espacioId_fkey";

-- DropIndex
DROP INDEX "Reserva_espacioId_fechaInicio_fechaFin_idx";

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "tipoEspacio" "TipoEspacio" NOT NULL,
ALTER COLUMN "espacioId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Reserva_tipoEspacio_fechaInicio_fechaFin_idx" ON "Reserva"("tipoEspacio", "fechaInicio", "fechaFin");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
