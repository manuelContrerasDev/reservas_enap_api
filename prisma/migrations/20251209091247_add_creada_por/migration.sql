-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "creadaPor" TEXT,
ADD COLUMN     "telefonoResponsable" TEXT;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_creadaPor_fkey" FOREIGN KEY ("creadaPor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
