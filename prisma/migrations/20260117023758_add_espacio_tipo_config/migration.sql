/*
  Warnings:

  - The `cancelledBy` column on the `Reserva` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- DropIndex
DROP INDEX "AuditLog_entityId_idx";

-- DropIndex
DROP INDEX "AuditLog_userId_idx";

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "cancelledBy",
ADD COLUMN     "cancelledBy" "CancelledBy";

-- CreateTable
CREATE TABLE "EspacioTipoConfig" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEspacio" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenes" JSONB NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "unidadesTotales" INTEGER,
    "cupoTotal" INTEGER,
    "modalidadCobro" "ModalidadCobro" NOT NULL,
    "capacidadSocio" INTEGER,
    "capacidadExterno" INTEGER,
    "capacidadComun" INTEGER,
    "capacidadAlojamiento" INTEGER,
    "maximoAbsoluto" INTEGER,
    "precioBaseSocio" INTEGER NOT NULL,
    "precioBaseExterno" INTEGER NOT NULL,
    "precioExtraSocio" INTEGER NOT NULL,
    "precioExtraExterno" INTEGER NOT NULL,
    "precioPiscinaSocio" INTEGER,
    "precioPiscinaExterno" INTEGER,
    "freePiscinaSocio" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EspacioTipoConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EspacioTipoConfig_tipo_key" ON "EspacioTipoConfig"("tipo");

-- CreateIndex
CREATE INDEX "EspacioTipoConfig_tipo_visible_idx" ON "EspacioTipoConfig"("tipo", "visible");

-- CreateIndex
CREATE INDEX "AuditLog_entity_createdAt_idx" ON "AuditLog"("entity", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Invitado_reservaId_idx" ON "Invitado"("reservaId");
