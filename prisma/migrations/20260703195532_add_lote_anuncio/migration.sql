-- CreateTable
CREATE TABLE "LoteAnuncio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL DEFAULT 'Goiânia',
    "estado" TEXT NOT NULL DEFAULT 'GO',
    "area" DOUBLE PRECISION NOT NULL,
    "frente" DOUBLE PRECISION,
    "preco" DOUBLE PRECISION NOT NULL,
    "loteamentoId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoteAnuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoteAnuncioFoto" (
    "id" TEXT NOT NULL,
    "loteAnuncioId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "legenda" TEXT,

    CONSTRAINT "LoteAnuncioFoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoteAnuncio_slug_key" ON "LoteAnuncio"("slug");

-- AddForeignKey
ALTER TABLE "LoteAnuncio" ADD CONSTRAINT "LoteAnuncio_loteamentoId_fkey" FOREIGN KEY ("loteamentoId") REFERENCES "Empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteAnuncioFoto" ADD CONSTRAINT "LoteAnuncioFoto_loteAnuncioId_fkey" FOREIGN KEY ("loteAnuncioId") REFERENCES "LoteAnuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
