export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { GaleriaFotos } from '@/components/galeria-fotos'
import MapaEmpreendimento from '@/components/mapa-empreendimento-loader'
import {
  MapPin,
  ChevronLeft,
  MessageCircle,
  Building2,
  Wallet,
  LandPlot,
  Ruler,
  ArrowRight,
} from 'lucide-react'

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5562999999999'

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtArea(v: number) {
  return `${v.toLocaleString('pt-BR')}m²`
}

async function getLote(slug: string) {
  return prisma.loteAnuncio.findUnique({
    where: { slug },
    include: {
      fotos: { orderBy: { ordem: 'asc' } },
      loteamento: { select: { nome: true, slug: true, latitude: true, longitude: true } },
    },
  })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const lote = await prisma.loteAnuncio.findUnique({
    where: { slug },
    select: { titulo: true, bairro: true, cidade: true, descricao: true, ativo: true, fotos: { orderBy: { ordem: 'asc' }, take: 1, select: { url: true } } },
  })
  if (!lote || !lote.ativo) return { title: 'Lote não encontrado' }

  return {
    title: `${lote.titulo} | Só Terrenos GO`,
    description: lote.descricao || `${lote.titulo} em ${lote.bairro}, ${lote.cidade}.`,
    openGraph: lote.fotos[0] ? { images: [lote.fotos[0].url] } : undefined,
  }
}

export default async function LotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lote = await getLote(slug)

  if (!lote || !lote.ativo) notFound()

  const temLocalizacao = lote.loteamento?.latitude != null && lote.loteamento?.longitude != null

  const fotosGaleria = lote.fotos.map((f) => ({ url: f.url, tipo: 'OUTRO', legenda: f.legenda }))

  const ctaHref = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Olá! Tenho interesse no lote ${lote.titulo} em ${lote.bairro}. Pode me dar mais informações?`,
  )}`

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav
        className="sticky top-0 z-50 h-16 flex items-center px-6 border-b"
        style={{ background: 'rgba(15,31,15,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E07B3A' }}>
              <MapPin size={14} className="text-white" />
            </span>
            <span style={{ fontWeight: 700, color: 'white' }}>Só Terrenos</span>
            <span style={{ fontWeight: 700, color: '#E07B3A' }}>GO</span>
          </Link>
          <Link href="/lotes" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <ChevronLeft size={14} />
            Lotes
          </Link>
        </div>
      </nav>

      {/* ── SEÇÃO 1: HERO COM GALERIA ── */}
      <section className="px-6 py-10" style={{ background: 'linear-gradient(160deg, #0F1F0F 0%, #080F08 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <GaleriaFotos fotos={fotosGaleria} nome={lote.titulo} />

          <div className="mt-6 flex flex-col gap-3">
            <span
              className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ background: '#E07B3A' }}
            >
              <LandPlot size={12} />
              Lote
            </span>

            <h1 className="text-3xl md:text-4xl font-black text-[#F7F2EA] leading-tight">
              {lote.titulo}
            </h1>

            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin size={14} />
              {lote.bairro} · {lote.cidade}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 2: INFORMAÇÕES PRINCIPAIS ── */}
      <section className="px-6 py-16" style={{ background: '#F7F2EA' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Área</p>
              <p className="text-[#1E3A1E] font-bold text-lg flex items-center gap-1.5">
                <LandPlot size={16} />
                {fmtArea(lote.area)}
              </p>
            </div>

            {lote.frente != null && (
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
                <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Frente</p>
                <p className="text-[#1E3A1E] font-bold text-lg flex items-center gap-1.5">
                  <Ruler size={16} />
                  {fmtArea(lote.frente)}
                </p>
              </div>
            )}

            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Preço</p>
              <p className="text-[#1E3A1E] font-bold text-lg">{fmtPreco(lote.preco)}</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Localização</p>
              <p className="text-[#1E3A1E] font-bold text-lg flex items-center gap-1.5">
                <MapPin size={16} />
                {lote.bairro}
              </p>
            </div>
          </div>

          {/* Card do loteamento associado */}
          {lote.loteamento && (
            <div
              className="mt-6 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ background: 'rgba(224,123,58,0.08)', border: '1px solid rgba(224,123,58,0.25)' }}
            >
              <div className="flex items-start gap-3">
                <Building2 size={20} className="mt-0.5 shrink-0" style={{ color: '#E07B3A' }} />
                <div>
                  <p className="text-[#1E3A1E] font-semibold text-sm">
                    Este lote fica no loteamento {lote.loteamento.nome}
                  </p>
                  <p className="text-[#1E3A1E]/60 text-sm mt-0.5">
                    Veja a infraestrutura e demais informações do loteamento completo.
                  </p>
                </div>
              </div>
              <Link
                href={`/catalogo/${lote.loteamento.slug}`}
                className="shrink-0 inline-flex items-center gap-1.5 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ background: '#E07B3A' }}
              >
                Ver loteamento
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {/* ── SEÇÃO 3: DESCRIÇÃO ── */}
          {lote.descricao && (
            <div className="mt-12">
              <p className="text-[#1E3A1E]/70 leading-relaxed whitespace-pre-line">{lote.descricao}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SEÇÃO 4: LOCALIZAÇÃO ── */}
      {temLocalizacao && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Localização</h2>
            <div className="w-full h-96 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <MapaEmpreendimento
                nome={lote.titulo}
                bairro={lote.bairro}
                latitude={lote.loteamento!.latitude!}
                longitude={lote.loteamento!.longitude!}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 5: CTA FINAL ── */}
      <section
        className="py-24 px-6 text-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #0F1F0F 0%, #080F08 65%)' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(224,123,58,0.08) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <div className="relative max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-[#F7F2EA] mb-8 leading-tight">
            Interessado neste lote?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-105"
              style={{
                background: '#E07B3A',
                boxShadow: '0 8px 40px rgba(224,123,58,0.35)',
              }}
            >
              <Wallet size={18} />
              Falar no WhatsApp
            </a>
            <Link
              href="/conversar"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-8 py-4 rounded-2xl text-base border border-white/25 hover:border-white/50 hover:bg-white/5 transition-all duration-200"
            >
              <MessageCircle size={18} />
              Conversar com a IA
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
