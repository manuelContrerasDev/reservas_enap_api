-- CreateTable
CREATE TABLE "LunesExcepcion" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LunesExcepcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LunesExcepcion_fecha_key" ON "LunesExcepcion"("fecha");

-- CreateIndex
CREATE INDEX "LunesExcepcion_fecha_idx" ON "LunesExcepcion"("fecha");
