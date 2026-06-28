-- CreateEnum
CREATE TYPE "TipoNegocio" AS ENUM ('IMOVEL', 'LOTE');

-- AlterTable
ALTER TABLE "Empreendimento" ADD COLUMN "tipoNegocio" "TipoNegocio" NOT NULL DEFAULT 'IMOVEL';
ALTER TABLE "Empreendimento" ADD COLUMN "infraestrutura" TEXT;
ALTER TABLE "Empreendimento" ADD COLUMN "areaTotalLoteamento" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "empreendimentoId" TEXT NOT NULL,
    "quadra" TEXT,
    "numero" TEXT,
    "areaTerreno" DOUBLE PRECISION NOT NULL,
    "frente" DOUBLE PRECISION,
    "preco" DOUBLE PRECISION NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
