export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import type { Prisma, StatusObra, TipoNegocio } from '@prisma/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import NavbarPublica from '@/components/navbar-publica'
import { FiltrosCatalogo } from '@/components/catalogo/filtros-catalogo'
import { MapPin, Shield } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto',
}

function parseParam(value: string | undefined): string[] {
  return value ? value.split(',').filter(Boolean) : []
}

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 })
}

function fmtArea(v: number) {
  return `${v.toLocaleString('pt-BR')}m²`
}

type CardItem = {
  id: string
  href: string
  fotoUrl: string | null
  badge: string
  badgeColor: string
  nome: string
  bairro: string | null
  cidade: string | null
  area: number | null
  preco: number | null
  createdAt: Date
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; incorporadora?: string; cidade?: string; bairro?: string; status?: string }>
}) {
  const sp = await searchParams
  const tipo = parseParam(sp.tipo)
  const incorporadora = parseParam(sp.incorporadora)
  const cidade = parseParam(sp.cidade)
  const bairro = parseParam(sp.bairro)
  const status = parseParam(sp.status)

  const [incorporadoras, cidadesComEmpreendimentos, bairrosComEmpreendimentos] = await Promise.all([
    prisma.incorporadora.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true },
    }),
    prisma.cidade.findMany({
      where: { empreendimentos: { some: { ativo: true } } },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true },
    }),
    prisma.bairro.findMany({
      where: { empreendimentos: { some: { ativo: true } } },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, cidadeId: true },
    }),
  ])

  const tipoNegocioValues = tipo.filter((t): t is TipoNegocio => t === 'LOTE' || t === 'IMOVEL')

  const empreendimentoWhere: Prisma.EmpreendimentoWhereInput = {
    ativo: true,
    ...(tipoNegocioValues.length > 0 ? { tipoNegocio: { in: tipoNegocioValues } } : {}),
    ...(incorporadora.length > 0 ? { incorporadoraId: { in: incorporadora } } : {}),
    ...(cidade.length > 0 ? { cidadeId: { in: cidade } } : {}),
    ...(bairro.length > 0 ? { bairroId: { in: bairro } } : {}),
    ...(status.length > 0 ? { status: { in: status as StatusObra[] } } : {}),
  }

  const outrosFiltrosAtivos = incorporadora.length > 0 || cidade.length > 0 || bairro.length > 0 || status.length > 0
  const incluirEmpreendimentos = tipo.length === 0 || tipoNegocioValues.length > 0
  const incluirAvulsos = tipo.includes('AVULSO') || (tipo.length === 0 && !outrosFiltrosAtivos)

  const [empreendimentos, avulsos] = await Promise.all([
    incluirEmpreendimentos
      ? prisma.empreendimento.findMany({
          where: empreendimentoWhere,
          orderBy: { createdAt: 'desc' },
          include: {
            fotos: { where: { tipo: 'FACHADA' }, orderBy: { ordem: 'asc' }, take: 1 },
            bairro: { select: { nome: true } },
            cidade: { select: { nome: true } },
          },
        })
      : Promise.resolve([]),
    incluirAvulsos
      ? prisma.loteAnuncio.findMany({
          where: { ativo: true },
          orderBy: { createdAt: 'desc' },
          include: { fotos: { orderBy: { ordem: 'asc' }, take: 1 } },
        })
      : Promise.resolve([]),
  ])

  const cards: CardItem[] = [
    ...empreendimentos.map((e) => {
      const isLote = e.tipoNegocio === 'LOTE'
      const preco = isLote && e.lotePrecoMin ? e.lotePrecoMin : e.precoMin
      return {
        id: e.id,
        href: `/catalogo/${e.slug}`,
        fotoUrl: e.fotos[0]?.url ?? null,
        badge: isLote ? 'Loteamento' : (STATUS_LABEL[e.status] ?? e.status),
        badgeColor: isLote ? '#1E3A1E' : '#E07B3A',
        nome: e.nome,
        bairro: e.bairro?.nome ?? e.bairroTexto ?? null,
        cidade: e.cidade?.nome ?? e.cidadeTexto ?? null,
        area: isLote && e.loteAreaMin && e.loteAreaMin > 0 ? e.loteAreaMin : null,
        preco: preco && preco > 0 ? preco : null,
        createdAt: e.createdAt,
      }
    }),
    ...avulsos.map((l) => ({
      id: l.id,
      href: `/lotes/${l.slug}`,
      fotoUrl: l.fotos[0]?.url ?? null,
      badge: 'Lote avulso',
      badgeColor: '#1E3A1E',
      nome: l.titulo,
      bairro: l.bairro,
      cidade: l.cidade,
      area: l.area > 0 ? l.area : null,
      preco: l.preco > 0 ? l.preco : null,
      createdAt: l.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="min-h-screen" style={{ background: '#080F08' }}>
      <NavbarPublica active="catalogo" />

      <main className="max-w-6xl mx-auto px-6 py-14">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Catálogo de Empreendimentos</h1>

        <FiltrosCatalogo
          incorporadoras={incorporadoras}
          cidades={cidadesComEmpreendimentos}
          bairros={bairrosComEmpreendimentos}
        />

        {cards.length === 0 ? (
          <p className="text-white/40 text-center py-24">Nenhum empreendimento encontrado.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
              >
                <div className="relative aspect-video" style={{ background: '#080F08' }}>
                  {c.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.fotoUrl} alt={c.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/15 text-4xl">🏘</div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge style={{ background: c.badgeColor, color: 'white', border: 'none' }}>{c.badge}</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h2 className="font-semibold text-white truncate">{c.nome}</h2>
                  {(c.bairro || c.cidade) && (
                    <p className="text-sm text-white/40">{[c.bairro, c.cidade].filter(Boolean).join(' · ')}</p>
                  )}
                  {c.area != null && (
                    <p className="text-sm text-white/60">A partir de {fmtArea(c.area)}</p>
                  )}
                  <p className="text-sm font-medium" style={{ color: '#E07B3A' }}>
                    {c.preco != null ? `A partir de ${fmtPreco(c.preco)}` : 'Consulte valores'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer style={{ background: '#0F1F0F' }} className="py-10 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: '#E07B3A' }}
            >
              <MapPin size={12} className="text-white" />
            </span>
            <div>
              <p className="text-white/80 font-semibold text-sm leading-tight">
                <span style={{ fontWeight: 700, color: 'white' }}>Só Terrenos</span>{' '}
                <span style={{ fontWeight: 700, color: '#E07B3A' }}>GO</span>
              </p>
              <p className="text-white/25 text-xs">© 2025 · CRECI-GO</p>
            </div>
          </div>

          <div className="flex items-center gap-8 flex-wrap justify-center">
            {[
              { href: '/catalogo', label: 'Catálogo' },
              { href: '/lotes', label: 'Lotes' },
              { href: '/mapa', label: 'Mapa' },
              { href: '/proprietarios', label: 'Para Proprietários' },
              { href: '/conversar', label: 'Conversar' },
              { href: '/blog', label: 'Blog' },
              { href: '/newsletter', label: 'Newsletter' },
              { href: '/admin/login', label: 'Admin' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative text-white/35 hover:text-white/70 text-sm transition-colors duration-200 pb-0.5 group"
              >
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-white/40 transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-white/25 text-xs">
            <Shield size={11} />
            Dados protegidos · LGPD
          </div>
        </div>
      </footer>
    </div>
  )
}
