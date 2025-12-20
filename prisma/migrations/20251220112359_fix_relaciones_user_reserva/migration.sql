/*
  Warnings:

  - The values [PENDIENTE] on the enum `ReservaEstado` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `GuestAuthorization` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReservaEstado_new" AS ENUM ('PENDIENTE_PAGO', 'CONFIRMADA', 'CANCELADA', 'RECHAZADA', 'CADUCADA', 'FINALIZADA');
ALTER TABLE "Reserva" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Reserva" ALTER COLUMN "estado" TYPE "ReservaEstado_new" USING ("estado"::text::"ReservaEstado_new");
ALTER TYPE "ReservaEstado" RENAME TO "ReservaEstado_old";
ALTER TYPE "ReservaEstado_new" RENAME TO "ReservaEstado";
DROP TYPE "ReservaEstado_old";
ALTER TABLE "Reserva" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_PAGO';
COMMIT;

-- DropForeignKey
ALTER TABLE "GuestAuthorization" DROP CONSTRAINT "GuestAuthorization_invitadoId_fkey";

-- DropForeignKey
ALTER TABLE "GuestAuthorization" DROP CONSTRAINT "GuestAuthorization_socioId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "after" JSONB,
ADD COLUMN     "before" JSONB;

-- DropTable
DROP TABLE "GuestAuthorization";
