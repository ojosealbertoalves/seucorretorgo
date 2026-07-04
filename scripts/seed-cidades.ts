/**
 * One-shot: cadastra as cidades iniciais e faz backfill de cidadeId nos
 * empreendimentos existentes cujo cidadeTexto bata com o nome de uma cidade.
 * Execute: npx tsx scripts/seed-cidades.ts
 */
import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const CIDADES = [
  'Goiânia',
  'Aparecida de Goiânia',
  'Senador Canedo',
  'Trindade',
  'Goianira',
]

async function main() {
  for (const nome of CIDADES) {
    await prisma.cidade.upsert({
      where: { nome },
      update: {},
      create: { nome, estado: 'GO' },
    })
    console.log(`Cidade ok: ${nome}`)
  }

  const cidades = await prisma.cidade.findMany()
  const empreendimentos = await prisma.empreendimento.findMany({
    where: { cidadeId: null, cidadeTexto: { not: null } },
    select: { id: true, cidadeTexto: true },
  })

  for (const e of empreendimentos) {
    const match = cidades.find((c) => c.nome.toLowerCase() === e.cidadeTexto?.toLowerCase())
    if (match) {
      await prisma.empreendimento.update({ where: { id: e.id }, data: { cidadeId: match.id } })
      console.log(`Backfill: empreendimento ${e.id} -> cidade ${match.nome}`)
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
