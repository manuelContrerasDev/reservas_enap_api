/*
  Warnings:

  - The values [CANCELADA] on the enum `ReservaEstado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReservaEstado_new" AS ENUM ('PENDIENTE_PAGO', 'PENDIENTE_VALIDACION', 'CONFIRMADA', 'RECHAZADA', 'CADUCADA', 'FINALIZADA');
ALTER TABLE "Reserva" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Reserva" ALTER COLUMN "estado" TYPE "ReservaEstado_new" USING ("estado"::text::"ReservaEstado_new");
ALTER TYPE "ReservaEstado" RENAME TO "ReservaEstado_old";
ALTER TYPE "ReservaEstado_new" RENAME TO "ReservaEstado";
DROP TYPE "ReservaEstado_old";
ALTER TABLE "Reserva" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_PAGO';
COMMIT;
