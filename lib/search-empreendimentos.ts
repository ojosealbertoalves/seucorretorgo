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

const COMBINING_MARK_MIN = 0x0300
const COMBINING_MARK_MAX = 0x036f

function removerAcentos(str: string): string {
  return Array.from(str.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0
      return code < COMBINING_MARK_MIN || code > COMBINING_MARK_MAX
    })
    .join('')
    .toLowerCase()
}

/**
 * `contains` com `mode: insensitive` ignora maiúsculas/minúsculas mas não acentos —
 * "goiania" não bate em "Goiânia" no Postgres. Busca os nomes cadastrados de
 * cidade/bairro e, comparando sem acento, expande os termos com o nome oficial
 * para que a query com `contains` encontre o registro mesmo com acentuação diferente.
 */
async function expandirTermosSemAcento(termos: string[]): Promise<string[]> {
  const [cidades, bairros] = await Promise.all([
    prisma.cidade.findMany({ select: { nome: true } }),
    prisma.bairro.findMany({ select: { nome: true } }),
  ])
  const nomes = [...new Set([...cidades.map((c) => c.nome), ...bairros.map((b) => b.nome)])]

  const expandido = new Set(termos)
  for (const termo of termos) {
    const alvo = removerAcentos(termo)
    const match = nomes.find((n) => removerAcentos(n) === alvo)
    if (match) expandido.add(match)
  }
  return [...expandido]
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

  // O termo de localização pode ser um bairro OU uma cidade (ex: "Senador
  // Canedo" é cidade, não bairro). Prioriza os relacionamentos novos
  // (cidade/bairro cadastrados via dropdown) e usa `contains` em vez de
  // igualdade exata — "in" exigia bater caractere a caractere (inclusive
  // acentos), então "Goiania" sem acento não encontrava "Goiânia" e a busca
  // caía inteira no fallback. Os campos de texto legados (cidadeTexto/
  // bairroTexto) continuam como último recurso para empreendimentos antigos
  // sem cidadeId/bairroId preenchido.
  if (opts.useBairro && filtros.bairrosInteresse && filtros.bairrosInteresse.length > 0) {
    const termos = filtros.bairrosInteresse
    and.push({
      OR: [
        // Prioridade 1: relacionamento novo (dropdown) — cidade
        ...termos.map((termo) => ({
          cidade: { is: { nome: { contains: termo, mode: 'insensitive' as const } } },
        })),
        // Prioridade 2: relacionamento novo (dropdown) — bairro
        ...termos.map((termo) => ({
          bairro: { is: { nome: { contains: termo, mode: 'insensitive' as const } } },
        })),
        { bairrosProximos: { hasSome: termos } },
        // Fallback: campos de texto livre antigos
        ...termos.map((termo) => ({ cidadeTexto: { contains: termo, mode: 'insensitive' as const } })),
        ...termos.map((termo) => ({ bairroTexto: { contains: termo, mode: 'insensitive' as const } })),
      ],
    })
  }

  if (opts.usePreco && filtros.precoMax) {
    and.push({
      OR: [
        { lotePrecoMin: { lte: filtros.precoMax, gt: 0 } },
        { precoMin: { lte: filtros.precoMax, gt: 0 } },
      ],
    })
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
    include: EMPREENDIMENTO_INCLUDE,
  })

  return rows.map(mapRow)
}

export type BuscaEmpreendimentosResultado = {
  results: EmpreendimentoResult[]
  /** true quando o resultado só veio depois de ignorar o filtro de bairro/cidade */
  relaxouLocalizacao: boolean
  /** true quando o resultado só veio depois de também ignorar o filtro de preço */
  relaxouPreco: boolean
}

export async function searchEmpreendimentosDetalhado(
  filtros: FiltrosBusca,
  take = 4,
): Promise<BuscaEmpreendimentosResultado> {
  // Busca completa com todos os filtros
  let results = await runQuery(filtros, { useBairro: true, usePreco: true }, take)
  if (results.length) return { results, relaxouLocalizacao: false, relaxouPreco: false }

  // Antes de relaxar a localização, tenta encontrar a cidade/bairro cadastrado
  // comparando sem acento (ex: "goiania" -> "Goiânia") — evita cair no fallback
  // genérico só porque o termo veio sem acentuação.
  if (filtros.bairrosInteresse?.length) {
    const termosExpandidos = await expandirTermosSemAcento(filtros.bairrosInteresse)
    if (termosExpandidos.length > filtros.bairrosInteresse.length) {
      results = await runQuery(
        { ...filtros, bairrosInteresse: termosExpandidos },
        { useBairro: true, usePreco: true },
        take,
      )
      if (results.length) return { results, relaxouLocalizacao: false, relaxouPreco: false }
    }
  }

  // Relaxa bairro/cidade
  results = await runQuery(filtros, { useBairro: false, usePreco: true }, take)
  if (results.length) return { results, relaxouLocalizacao: true, relaxouPreco: false }

  // Relaxa preço também
  results = await runQuery(filtros, { useBairro: false, usePreco: false }, take)
  return { results, relaxouLocalizacao: true, relaxouPreco: results.length > 0 }
}

export async function searchEmpreendimentos(
  filtros: FiltrosBusca,
  take = 4,
): Promise<EmpreendimentoResult[]> {
  const { results } = await searchEmpreendimentosDetalhado(filtros, take)
  return results
}

/** Nomes + id dos empreendimentos ativos — usado para detectar menção direta pelo nome na mensagem do usuário. */
export async function listNomesAtivos(): Promise<{ id: string; nome: string }[]> {
  return prisma.empreendimento.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getEmpreendimentoPorId(id: string): Promise<EmpreendimentoResult | null> {
  const row = await prisma.empreendimento.findFirst({
    where: { id, ativo: true },
    include: EMPREENDIMENTO_INCLUDE,
  })
  return row ? mapRow(row) : null
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
