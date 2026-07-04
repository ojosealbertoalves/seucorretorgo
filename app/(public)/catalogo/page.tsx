export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Prisma, StatusObra } from '@prisma/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import NavbarPublica from '@/components/navbar-publica'
import { MapPin, Shield } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto',
}

const TIPO_PARAM_TO_NEGOCIO: Record<string, 'IMOVEL' | 'LOTE'> = {
  IMOVEL: 'IMOVEL',
  LOTE: 'LOTE',
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
  bairro: string
  cidade: string
  area: number | null
  preco: number | null
  createdAt: Date
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; incorporadora?: string; status?: string; q?: string }>
}) {
  const { tipo = '', incorporadora = '', status = '', q = '' } = await searchParams

  const incorporadoras = await prisma.incorporadora.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true },
  })

  const buscaLocal: Prisma.StringFilter = { contains: q, mode: 'insensitive' }

  const empreendimentoWhere: Prisma.EmpreendimentoWhereInput = {
    ativo: true,
    ...(TIPO_PARAM_TO_NEGOCIO[tipo] ? { tipoNegocio: TIPO_PARAM_TO_NEGOCIO[tipo] } : {}),
    ...(incorporadora ? { incorporadoraId: incorporadora } : {}),
    ...(status ? { status: status as StatusObra } : {}),
    ...(q ? { OR: [{ bairro: buscaLocal }, { cidade: buscaLocal }] } : {}),
  }

  const incluirEmpreendimentos = tipo !== 'AVULSO'
  const incluirAvulsos = tipo === 'AVULSO' || (tipo === '' && !incorporadora && !status)

  const [empreendimentos, avulsos] = await Promise.all([
    incluirEmpreendimentos
      ? prisma.empreendimento.findMany({
          where: empreendimentoWhere,
          orderBy: { createdAt: 'desc' },
          include: { fotos: { where: { tipo: 'FACHADA' }, orderBy: { ordem: 'asc' }, take: 1 } },
        })
      : Promise.resolve([]),
    incluirAvulsos
      ? prisma.loteAnuncio.findMany({
          where: {
            ativo: true,
            ...(q ? { OR: [{ bairro: buscaLocal }, { cidade: buscaLocal }] } : {}),
          },
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
        bairro: e.bairro,
        cidade: e.cidade,
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

  const temFiltroAtivo = Boolean(tipo || incorporadora || status || q)

  const TIPO_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'LOTE', label: 'Loteamentos' },
    { value: 'IMOVEL', label: 'Imóveis' },
    { value: 'AVULSO', label: 'Lotes avulsos' },
  ] as const

  return (
    <div className="min-h-screen" style={{ background: '#080F08' }}>
      <NavbarPublica active="catalogo" />

      <main className="max-w-6xl mx-auto px-6 py-14">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Catálogo de Empreendimentos</h1>

        <form method="get" className="mb-10 space-y-4">
          {/* Linha 1 — tipo */}
          <div className="flex flex-wrap gap-2">
            {TIPO_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="submit"
                name="tipo"
                value={value}
                className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
                style={
                  tipo === value
                    ? { background: '#E07B3A', color: 'white' }
                    : { background: '#0F1F0F', border: '1px solid #1E3A1E', color: 'rgba(247,242,234,0.7)' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Linha 2 — filtros adicionais */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              name="incorporadora"
              defaultValue={incorporadora}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
            >
              <option value="">Todas as incorporadoras</option>
              {incorporadoras.map((i) => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
            >
              <option value="">Todos os status</option>
              <option value="LANCAMENTO">Lançamento</option>
              <option value="EM_OBRAS">Em obras</option>
              <option value="PRONTO">Pronto</option>
            </select>

            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Bairro ou cidade"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: '#E07B3A' }}
              >
                Filtrar
              </button>
              {temFiltroAtivo && (
                <Link href="/catalogo" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                  Limpar filtros
                </Link>
              )}
            </div>
          </div>
        </form>

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
                  <p className="text-sm text-white/40">{c.bairro} · {c.cidade}</p>
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
