-- CreateEnum
CREATE TYPE "TipoEspacio" AS ENUM ('CABANA', 'QUINCHO', 'PISCINA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SOCIO', 'EXTERNO');

-- CreateEnum
CREATE TYPE "ModalidadCobro" AS ENUM ('POR_NOCHE', 'POR_DIA', 'POR_PERSONA');

-- CreateEnum
CREATE TYPE "UsoReserva" AS ENUM ('USO_PERSONAL', 'CARGA_DIRECTA', 'TERCEROS');

-- CreateEnum
CREATE TYPE "ReservaEstado" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
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
CREATE TABLE "Espacio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoEspacio" NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "capacidadExtra" INTEGER,
    "tarifaClp" INTEGER NOT NULL,
    "tarifaExterno" INTEGER,
    "extraSocioPorPersona" INTEGER,
    "extraTerceroPorPersona" INTEGER,
    "descripcion" TEXT,
    "imagenUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "modalidadCobro" "ModalidadCobro" NOT NULL DEFAULT 'POR_NOCHE',
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
    "totalClp" INTEGER NOT NULL,
    "estado" "ReservaEstado" NOT NULL DEFAULT 'PENDIENTE',
    "nombreSocio" TEXT NOT NULL,
    "rutSocio" TEXT NOT NULL,
    "telefonoSocio" TEXT NOT NULL,
    "correoEnap" TEXT NOT NULL,
    "correoPersonal" TEXT,
    "usoReserva" "UsoReserva" NOT NULL DEFAULT 'USO_PERSONAL',
    "socioPresente" BOOLEAN NOT NULL DEFAULT true,
    "nombreResponsable" TEXT,
    "rutResponsable" TEXT,
    "emailResponsable" TEXT,
    "cantidadPersonas" INTEGER NOT NULL,
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

    CONSTRAINT "Invitado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sessionId" TEXT,
    "amountClp" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailConfirmToken_key" ON "User"("emailConfirmToken");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "GuestAuthorization_socioId_invitadoId_key" ON "GuestAuthorization"("socioId", "invitadoId");

-- CreateIndex
CREATE INDEX "Espacio_tipo_activo_idx" ON "Espacio"("tipo", "activo");

-- CreateIndex
CREATE INDEX "Reserva_estado_idx" ON "Reserva"("estado");

-- CreateIndex
CREATE INDEX "Reserva_fechaInicio_fechaFin_idx" ON "Reserva"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "Reserva_espacioId_fechaInicio_fechaFin_idx" ON "Reserva"("espacioId", "fechaInicio", "fechaFin");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_reservaId_key" ON "Pago"("reservaId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "GuestAuthorization" ADD CONSTRAINT "GuestAuthorization_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAuthorization" ADD CONSTRAINT "GuestAuthorization_invitadoId_fkey" FOREIGN KEY ("invitadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitado" ADD CONSTRAINT "Invitado_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
