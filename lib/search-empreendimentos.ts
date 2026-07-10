import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Ordem de exibição das fotos: FACHADA sempre primeiro
const FOTO_ORDEM: Record<string, number> = {
  FACHADA: 0,
  PERSPECTIVA: 1,
  AREA_LAZER: 2,
  PLANTA: 3,
  DECORADO: 4,
  OUTRO: 5,
}

const EMPREENDIMENTO_INCLUDE = {
  incorporadora: { select: { nome: true, logo: true, descricao: true } },
  tipologias: { where: { disponivel: true }, orderBy: { preco: 'asc' as const } },
  lotes: { where: { disponivel: true }, orderBy: { preco: 'asc' as const } },
  fotos: { orderBy: { ordem: 'asc' as const }, take: 10 },
  bairro: { select: { nome: true } },
  cidade: { select: { nome: true } },
} satisfies Prisma.EmpreendimentoInclude

type EmpreendimentoRow = Prisma.EmpreendimentoGetPayload<{ include: typeof EMPREENDIMENTO_INCLUDE }>

function mapRow(e: EmpreendimentoRow) {
  return {
    ...e,
    bairro: e.bairro?.nome ?? e.bairroTexto ?? '',
    cidade: e.cidade?.nome ?? e.cidadeTexto ?? '',
    fotos: [...e.fotos]
      .sort(
        (a, b) =>
          (FOTO_ORDEM[a.tipo] ?? 99) - (FOTO_ORDEM[b.tipo] ?? 99) || a.ordem - b.ordem,
      )
      .slice(0, 5),
  }
}

export type EmpreendimentoResult = ReturnType<typeof mapRow>

/**
 * Busca TODOS os empreendimentos ativos, sem filtro nenhum no banco. O
 * filtro por cidade/nome é feito inteiramente em JS (app/api/chat/route.ts),
 * comparando texto sem acento — substitui as várias camadas de fallback que
 * existiam aqui (contains, expansão sem acento, relaxamento em cascata) por
 * uma única fonte de verdade: esta lista completa.
 */
export async function listEmpreendimentosAtivos(): Promise<EmpreendimentoResult[]> {
  const rows = await prisma.empreendimento.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
    include: EMPREENDIMENTO_INCLUDE,
  })
  return rows.map(mapRow)
}

export type FiltrosLotes = {
  bairro?: string | null
  areaMin?: number | null
  precoMax?: number | null
}

export async function searchLotes(filtros: FiltrosLotes) {
  const where: Prisma.LoteAnuncioWhereInput = { ativo: true }

  if (filtros.bairro) {
    where.bairro = { contains: filtros.bairro, mode: 'insensitive' }
  }
  if (filtros.areaMin) {
    where.area = { gte: filtros.areaMin }
  }
  if (filtros.precoMax) {
    where.preco = { lte: filtros.precoMax }
  }

  return prisma.loteAnuncio.findMany({
    where,
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      loteamento: { select: { nome: true, slug: true } },
      fotos: { orderBy: { ordem: 'asc' }, take: 1 },
    },
  })
}

export type LoteResult = Awaited<ReturnType<typeof searchLotes>>[number]
