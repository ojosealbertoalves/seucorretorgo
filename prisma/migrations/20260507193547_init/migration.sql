-- CreateEnum
CREATE TYPE "StatusObra" AS ENUM ('LANCAMENTO', 'EM_OBRAS', 'PRONTO');

-- CreateEnum
CREATE TYPE "TipoFoto" AS ENUM ('FACHADA', 'PERSPECTIVA', 'AREA_LAZER', 'PLANTA', 'DECORADO', 'OUTRO');

-- CreateTable
CREATE TABLE "Empreendimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "construtora" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "bairro" TEXT NOT NULL,
    "bairrosProximos" TEXT[],
    "endereco" TEXT,
    "cidade" TEXT NOT NULL DEFAULT 'Goiânia',
    "estado" TEXT NOT NULL DEFAULT 'GO',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "precoMin" DOUBLE PRECISION NOT NULL,
    "precoMax" DOUBLE PRECISION NOT NULL,
    "aceitaFgts" BOOLEAN NOT NULL DEFAULT false,
    "aceitaFinanciamento" BOOLEAN NOT NULL DEFAULT true,
    "programaMcmv" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusObra" NOT NULL DEFAULT 'LANCAMENTO',
    "entregaPrevista" TEXT,
    "percentualObra" INTEGER,
    "diferenciais" TEXT[],
    "destaqueIa" TEXT NOT NULL,
    "descricaoCompleta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empreendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tipologia" (
    "id" TEXT NOT NULL,
    "empreendimentoId" TEXT NOT NULL,
    "quartos" INTEGER NOT NULL,
    "suites" INTEGER NOT NULL DEFAULT 0,
    "banheiros" INTEGER NOT NULL DEFAULT 1,
    "areaPrivativa" DOUBLE PRECISION NOT NULL,
    "areaTotal" DOUBLE PRECISION,
    "vagas" INTEGER NOT NULL DEFAULT 1,
    "preco" DOUBLE PRECISION NOT NULL,
    "plantaUrl" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tipologia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "empreendimentoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "TipoFoto" NOT NULL DEFAULT 'FACHADA',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "legenda" TEXT,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "orcamentoMax" DOUBLE PRECISION,
    "bairrosInteresse" TEXT[],
    "tipoImovel" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "historicoJson" JSONB NOT NULL DEFAULT '[]',
    "resumoIa" TEXT,
    "scoreQualificacao" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empreendimento_slug_key" ON "Empreendimento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Tipologia" ADD CONSTRAINT "Tipologia_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
