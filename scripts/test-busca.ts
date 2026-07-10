import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Teste 1: todos os empreendimentos ativos
  const todos = await prisma.empreendimento.findMany({
    where: { ativo: true },
    include: { cidade: true, bairro: true, incorporadora: true },
  })

  console.log('\n=== TODOS OS EMPREENDIMENTOS ATIVOS ===')
  todos.forEach((e) =>
    console.log({
      nome: e.nome,
      cidadeId: e.cidadeId,
      cidadeNome: e.cidade?.nome,
      cidadeTexto: e.cidadeTexto,
      bairroId: e.bairroId,
      bairroNome: e.bairro?.nome,
      bairroTexto: e.bairroTexto,
      lotePrecoMin: e.lotePrecoMin,
      precoMin: e.precoMin,
      tipoNegocio: e.tipoNegocio,
    }),
  )

  // Teste 2: busca por Goiânia via relacionamento
  const porRelacionamento = await prisma.empreendimento.findMany({
    where: {
      ativo: true,
      cidade: { nome: { contains: 'Goiânia', mode: 'insensitive' } },
    },
    include: { cidade: true },
  })
  console.log('\n=== BUSCA POR RELACIONAMENTO (cidade.nome) ===')
  console.log('Encontrados:', porRelacionamento.length)
  porRelacionamento.forEach((e) => console.log(e.nome, '→', e.cidade?.nome))

  // Teste 3: busca por texto antigo
  const porTexto = await prisma.empreendimento.findMany({
    where: {
      ativo: true,
      cidadeTexto: { contains: 'Goiânia', mode: 'insensitive' },
    },
  })
  console.log('\n=== BUSCA POR TEXTO ANTIGO (cidadeTexto) ===')
  console.log('Encontrados:', porTexto.length)
  porTexto.forEach((e) => console.log(e.nome, '→', e.cidadeTexto))

  // Teste 4: busca por 'goiania' sem acento
  const porGoianiaSemAcento = await prisma.empreendimento.findMany({
    where: {
      ativo: true,
      OR: [
        { cidade: { nome: { contains: 'goiania', mode: 'insensitive' } } },
        { cidadeTexto: { contains: 'goiania', mode: 'insensitive' } },
      ],
    },
    include: { cidade: true },
  })
  console.log('\n=== BUSCA SEM ACENTO (goiania) ===')
  console.log('Encontrados:', porGoianiaSemAcento.length)

  await prisma.$disconnect()
}

main().catch(console.error)
