-- CreateEnum
CREATE TYPE "TipoEspacio" AS ENUM ('CABANA', 'QUINCHO', 'PISCINA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SOCIO', 'EXTERNO');

-- CreateEnum
CREATE TYPE "ModalidadCobro" AS ENUM ('POR_NOCHE', 'POR_DIA', 'POR_PERSONA');

-- CreateEnum
CREATE TYPE "UsoReserva" AS ENUM ('USO_PERSONAL', 'CARGA_DIRECTA', 'TERCEROS');

-- CreateEnum
CREATE TYPE "ReservaEstado" AS ENUM ('PENDIENTE_PAGO', 'CONFIRMADA', 'CANCELADA', 'RECHAZADA', 'CADUCADA', 'FINALIZADA', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "rut" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SOCIO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "emailConfirmToken" TEXT,
    "emailConfirmExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestAuthorization" (
    "id" TEXT NOT NULL,
    "socioId" TEXT NOT NULL,
    "invitadoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "Espacio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoEspacio" NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "descripcion" TEXT,
    "imagenUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "modalidadCobro" "ModalidadCobro" NOT NULL DEFAULT 'POR_NOCHE',
    "precioBaseSocio" INTEGER NOT NULL DEFAULT 0,
    "precioBaseExterno" INTEGER NOT NULL DEFAULT 0,
    "precioPersonaSocio" INTEGER NOT NULL DEFAULT 3500,
    "precioPersonaExterno" INTEGER NOT NULL DEFAULT 4500,
    "precioPiscinaSocio" INTEGER NOT NULL DEFAULT 3500,
    "precioPiscinaExterno" INTEGER NOT NULL DEFAULT 4500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Espacio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "espacioId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "usoReserva" "UsoReserva" NOT NULL DEFAULT 'USO_PERSONAL',
    "estado" "ReservaEstado" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "nombreSocio" TEXT NOT NULL,
    "rutSocio" TEXT NOT NULL,
    "telefonoSocio" TEXT NOT NULL,
    "correoEnap" TEXT NOT NULL,
    "correoPersonal" TEXT,
    "nombreResponsable" TEXT,
    "rutResponsable" TEXT,
    "emailResponsable" TEXT,
    "cantidadAdultos" INTEGER NOT NULL DEFAULT 1,
    "cantidadNinos" INTEGER NOT NULL DEFAULT 0,
    "cantidadPiscina" INTEGER NOT NULL DEFAULT 0,
    "precioBaseSnapshot" INTEGER NOT NULL DEFAULT 0,
    "precioPersonaSnapshot" INTEGER NOT NULL DEFAULT 0,
    "precioPiscinaSnapshot" INTEGER NOT NULL DEFAULT 0,
    "totalClp" INTEGER NOT NULL,
    "terminosAceptados" BOOLEAN NOT NULL DEFAULT false,
    "terminosVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitado" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "edad" INTEGER,
    "esPiscina" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invitado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "buyOrder" TEXT NOT NULL,
    "token" TEXT,
    "sessionId" TEXT,
    "provider" TEXT NOT NULL,
    "amountClp" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "authorizationCode" TEXT,
    "transactionDate" TEXT,
    "paymentTypeCode" TEXT,
    "responseCode" INTEGER,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailConfirmToken_key" ON "User"("emailConfirmToken");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "GuestAuthorization_socioId_invitadoId_key" ON "GuestAuthorization"("socioId", "invitadoId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Espacio_tipo_activo_idx" ON "Espacio"("tipo", "activo");

-- CreateIndex
CREATE INDEX "Reserva_estado_idx" ON "Reserva"("estado");

-- CreateIndex
CREATE INDEX "Reserva_fechaInicio_fechaFin_idx" ON "Reserva"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_reservaId_key" ON "Pago"("reservaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_buyOrder_key" ON "Pago"("buyOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_token_key" ON "Pago"("token");

-- CreateIndex
CREATE INDEX "Pago_status_idx" ON "Pago"("status");

-- CreateIndex
CREATE INDEX "Pago_buyOrder_idx" ON "Pago"("buyOrder");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- AddForeignKey
ALTER TABLE "GuestAuthorization" ADD CONSTRAINT "GuestAuthorization_invitadoId_fkey" FOREIGN KEY ("invitadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAuthorization" ADD CONSTRAINT "GuestAuthorization_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitado" ADD CONSTRAINT "Invitado_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
