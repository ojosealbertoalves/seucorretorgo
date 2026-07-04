export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { MapPin, LandPlot, Ruler, Building2 } from 'lucide-react'
import NavbarPublica from '@/components/navbar-publica'

export const metadata: Metadata = {
  title: 'Lotes disponíveis em Goiânia e região | Só Terrenos GO',
  description: 'Lotes avulsos e em loteamentos para comprar ou investir em Goiânia e região.',
}

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 })
}

function fmtArea(v: number) {
  return `${v.toLocaleString('pt-BR')}m²`
}

export default async function LotesPage({
  searchParams,
}: {
  searchParams: Promise<{ bairro?: string; areaMin?: string; precoMax?: string }>
}) {
  const { bairro, areaMin, precoMax } = await searchParams

  const where: Prisma.LoteAnuncioWhereInput = { ativo: true }
  if (bairro) where.bairro = { contains: bairro, mode: 'insensitive' }
  if (areaMin) where.area = { gte: parseFloat(areaMin) }
  if (precoMax) where.preco = { lte: parseFloat(precoMax) }

  const lotes = await prisma.loteAnuncio.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      loteamento: { select: { nome: true, slug: true } },
      fotos: { orderBy: { ordem: 'asc' }, take: 1 },
    },
  })

  return (
    <div className="min-h-screen" style={{ background: '#080F08' }}>
      <NavbarPublica active="lotes" />

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#E07B3A' }}>Lotes</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Lotes disponíveis em Goiânia e região
          </h1>
          <p className="text-white/50 text-base max-w-xl">
            Lotes avulsos e em loteamentos para comprar ou investir
          </p>
        </div>

        {/* Filtros */}
        <form
          method="get"
          className="rounded-2xl p-5 mb-10 grid sm:grid-cols-3 gap-4"
          style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
        >
          <div>
            <label className="text-white/40 text-xs font-medium mb-1.5 block">Bairro</label>
            <input
              type="text"
              name="bairro"
              defaultValue={bairro ?? ''}
              placeholder="Ex: Jardim Goiás"
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E3A1E' }}
            />
          </div>
          <div>
            <label className="text-white/40 text-xs font-medium mb-1.5 block">Área mínima (m²)</label>
            <input
              type="number"
              name="areaMin"
              min="0"
              defaultValue={areaMin ?? ''}
              placeholder="Ex: 200"
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E3A1E' }}
            />
          </div>
          <div>
            <label className="text-white/40 text-xs font-medium mb-1.5 block">Preço máximo (R$)</label>
            <input
              type="number"
              name="precoMax"
              min="0"
              defaultValue={precoMax ?? ''}
              placeholder="Ex: 300000"
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E3A1E' }}
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: '#E07B3A' }}
            >
              Filtrar
            </button>
            {(bairro || areaMin || precoMax) && (
              <Link href="/lotes" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Limpar filtros
              </Link>
            )}
          </div>
        </form>

        {/* Grid */}
        {lotes.length === 0 ? (
          <div className="text-center py-24">
            <LandPlot size={40} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-base">Nenhum lote encontrado.</p>
            <p className="text-white/25 text-sm mt-1">Tente ajustar os filtros ou volte em breve.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotes.map((l) => {
              const foto = l.fotos[0]
              return (
                <Link
                  key={l.id}
                  href={`/lotes/${l.slug}`}
                  className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-[#1E3A1E] hover:border-[#E07B3A]"
                  style={{ background: '#0F1F0F' }}
                >
                  <div className="relative aspect-video" style={{ background: '#080F08' }}>
                    {foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={foto.url} alt={l.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/15 text-4xl">
                        🏞
                      </div>
                    )}
                    {l.loteamento && (
                      <span
                        className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white flex items-center gap-1"
                        style={{ background: 'rgba(224,123,58,0.9)' }}
                      >
                        <Building2 size={11} />
                        Associado a: {l.loteamento.nome}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#E07B3A] transition-colors">
                      {l.titulo}
                    </h3>
                    <div className="flex items-center gap-3 text-white/50 text-sm mb-3">
                      <span className="flex items-center gap-1"><LandPlot size={13} /> {fmtArea(l.area)}</span>
                      {l.frente != null && (
                        <span className="flex items-center gap-1"><Ruler size={13} /> {fmtArea(l.frente)} frente</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#E07B3A' }}>
                      {fmtPreco(l.preco)}
                    </p>
                    <p className="text-white/40 text-xs flex items-center gap-1 mb-4">
                      <MapPin size={12} /> {l.bairro} · {l.cidade}
                    </p>
                    <div
                      className="mt-auto text-sm font-semibold text-center py-2.5 rounded-lg"
                      style={{ background: 'rgba(224,123,58,0.12)', color: '#E07B3A' }}
                    >
                      Ver lote
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
