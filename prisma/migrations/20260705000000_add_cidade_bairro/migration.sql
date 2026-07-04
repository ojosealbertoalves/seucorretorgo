-- CreateTable
CREATE TABLE "Cidade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'GO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bairro" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidadeId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bairro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cidade_nome_key" ON "Cidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Bairro_nome_cidadeId_key" ON "Bairro"("nome", "cidadeId");

-- AddForeignKey
ALTER TABLE "Bairro" ADD CONSTRAINT "Bairro_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameColumn (preserve existing data instead of drop+add)
ALTER TABLE "Empreendimento" RENAME COLUMN "bairro" TO "bairroTexto";
ALTER TABLE "Empreendimento" RENAME COLUMN "cidade" TO "cidadeTexto";

-- AlterTable: relax constraints on the renamed legacy columns
ALTER TABLE "Empreendimento" ALTER COLUMN "bairroTexto" DROP NOT NULL;
ALTER TABLE "Empreendimento" ALTER COLUMN "cidadeTexto" DROP NOT NULL;
ALTER TABLE "Empreendimento" ALTER COLUMN "cidadeTexto" DROP DEFAULT;

-- AlterTable: new relational columns
ALTER TABLE "Empreendimento" ADD COLUMN "cidadeId" TEXT,
ADD COLUMN "bairroId" TEXT;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_bairroId_fkey" FOREIGN KEY ("bairroId") REFERENCES "Bairro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
