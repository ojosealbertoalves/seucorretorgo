/*
  Warnings:

  - Added the required column `incorporadoraId` to the `Empreendimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Empreendimento" ADD COLUMN     "incorporadoraId" TEXT NOT NULL,
ALTER COLUMN "construtora" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Incorporadora" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "construtora" TEXT,
    "logo" TEXT,
    "site" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incorporadora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Incorporadora_nome_key" ON "Incorporadora"("nome");

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_incorporadoraId_fkey" FOREIGN KEY ("incorporadoraId") REFERENCES "Incorporadora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
