import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type FiltrosBusca = {
  tipo?: 'apartamento' | 'casa' | null
  tipoNegocio?: 'IMOVEL' | 'LOTE' | null
  quartos?: number | null
  areaTerreno?: number | null
  bairrosInteresse?: string[] | null
  precoMax?: number | null
  diferenciais?: string[] | null
  aceitaFgts?: boolean | null
  programaMcmv?: boolean | null
}

// Ordem de exibição das fotos: FACHADA sempre primeiro
const FOTO_ORDEM: Record<string, number> = {
  FACHADA: 0,
  PERSPECTIVA: 1,
  AREA_LAZER: 2,
  PLANTA: 3,
  DECORADO: 4,
  OUTRO: 5,
}

async function runQuery(
  filtros: FiltrosBusca,
  opts: { useBairro: boolean; usePreco: boolean },
  take = 4,
) {
  const where: Prisma.EmpreendimentoWhereInput = { ativo: true }
  const and: Prisma.EmpreendimentoWhereInput[] = []

  if (filtros.tipoNegocio) {
    where.tipoNegocio = filtros.tipoNegocio
  }

  // Lotes/loteamentos usam os campos agregados do Empreendimento
  // (loteAreaMin/loteAreaMax/lotePrecoMin) — a relação `lotes` costuma
  // ter só um registro placeholder (área/preço zerados, indisponível) e
  // não deve ser usada para filtrar ou o resultado vem sempre vazio.
  if (filtros.tipoNegocio === 'LOTE') {
    if (filtros.areaTerreno) {
      and.push({
        OR: [
          { loteAreaMin: { gte: filtros.areaTerreno } },
          { loteAreaMax: { gte: filtros.areaTerreno } },
        ],
      })
    }
  } else if (filtros.quartos) {
    where.tipologias = { some: { quartos: filtros.quartos, disponivel: true } }
  }

  if (opts.useBairro && filtros.bairrosInteresse && filtros.bairrosInteresse.length > 0) {
    and.push({
      OR: [
        { bairro: { is: { nome: { in: filtros.bairrosInteresse } } } },
        { bairroTexto: { in: filtros.bairrosInteresse } },
        { bairrosProximos: { hasSome: filtros.bairrosInteresse } },
      ],
    })
  }

  if (opts.usePreco && filtros.precoMax) {
    if (filtros.tipoNegocio === 'LOTE') {
      where.lotePrecoMin = { lte: filtros.precoMax }
    } else {
      where.precoMin = { lte: filtros.precoMax }
    }
  }

  if (filtros.aceitaFgts) where.aceitaFgts = true
  if (filtros.programaMcmv) where.programaMcmv = true

  if (filtros.diferenciais && filtros.diferenciais.length > 0) {
    where.diferenciais = { hasSome: filtros.diferenciais }
  }

  if (and.length > 0) where.AND = and

  const rows = await prisma.empreendimento.findMany({
    where,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      incorporadora: { select: { nome: true, logo: true, descricao: true } },
      tipologias: { where: { disponivel: true }, orderBy: { preco: 'asc' } },
      lotes: { where: { disponivel: true }, orderBy: { preco: 'asc' } },
      fotos: { orderBy: { ordem: 'asc' }, take: 10 },
      bairro: { select: { nome: true } },
      cidade: { select: { nome: true } },
    },
  })

  return rows.map((e) => ({
    ...e,
    bairro: e.bairro?.nome ?? e.bairroTexto ?? '',
    cidade: e.cidade?.nome ?? e.cidadeTexto ?? '',
    fotos: [...e.fotos]
      .sort(
        (a, b) =>
          (FOTO_ORDEM[a.tipo] ?? 99) - (FOTO_ORDEM[b.tipo] ?? 99) || a.ordem - b.ordem,
      )
      .slice(0, 5),
  }))
}

export type EmpreendimentoResult = Awaited<ReturnType<typeof runQuery>>[number]

export async function searchEmpreendimentos(
  filtros: FiltrosBusca,
  take = 4,
): Promise<EmpreendimentoResult[]> {
  // Busca completa com todos os filtros
  let results = await runQuery(filtros, { useBairro: true, usePreco: true }, take)
  if (results.length) return results

  // Relaxa bairro
  results = await runQuery(filtros, { useBairro: false, usePreco: true }, take)
  if (results.length) return results

  // Relaxa preço também
  return runQuery(filtros, { useBairro: false, usePreco: false }, take)
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
