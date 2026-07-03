export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { GaleriaFotos } from '@/components/galeria-fotos'
import MapaEmpreendimento from '@/components/mapa-empreendimento-loader'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import {
  MapPin,
  ChevronLeft,
  MessageCircle,
  Building2,
  Calendar,
  Wallet,
  CheckCircle,
  XCircle,
  BedDouble,
  Car,
  Ruler,
  LandPlot,
  ArrowRight,
} from 'lucide-react'

const STATUS_MAP: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto para morar',
}

const STATUS_COLOR: Record<string, string> = {
  LANCAMENTO: '#E07B3A',
  EM_OBRAS: '#3b82f6',
  PRONTO: '#10b981',
}

const TIPO_NEGOCIO_LABEL: Record<string, string> = {
  IMOVEL: 'Imóvel',
  LOTE: 'Lote/Loteamento',
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5562999999999'

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtArea(v: number) {
  return `${v.toLocaleString('pt-BR')}m²`
}

async function getEmpreendimento(slug: string) {
  return prisma.empreendimento.findUnique({
    where: { slug },
    include: {
      incorporadora: { select: { nome: true, logo: true } },
      fotos: { orderBy: [{ tipo: 'asc' }, { ordem: 'asc' }] },
      tipologias: { where: { disponivel: true }, orderBy: { preco: 'asc' } },
      lotes: { where: { disponivel: true }, orderBy: { preco: 'asc' } },
      lotesAnuncios: { where: { ativo: true }, orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const empreendimento = await prisma.empreendimento.findUnique({
    where: { slug },
    select: { nome: true, bairro: true, cidade: true, destaqueIa: true, ativo: true, fotos: { orderBy: { ordem: 'asc' }, take: 1, select: { url: true } } },
  })
  if (!empreendimento || !empreendimento.ativo) return { title: 'Empreendimento não encontrado' }

  return {
    title: `${empreendimento.nome} | Só Terrenos GO`,
    description: empreendimento.destaqueIa || `${empreendimento.nome} em ${empreendimento.bairro}, ${empreendimento.cidade}.`,
    openGraph: empreendimento.fotos[0] ? { images: [empreendimento.fotos[0].url] } : undefined,
  }
}

export default async function EmpreendimentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const empreendimento = await getEmpreendimento(slug)

  if (!empreendimento || !empreendimento.ativo) notFound()

  const isLote = empreendimento.tipoNegocio === 'LOTE'
  const temLocalizacao = empreendimento.latitude != null && empreendimento.longitude != null

  // Fotos com FACHADA priorizada, mantendo a ordem relativa das demais
  const fotosOrdenadas = [...empreendimento.fotos].sort((a, b) => {
    if (a.tipo === 'FACHADA' && b.tipo !== 'FACHADA') return -1
    if (a.tipo !== 'FACHADA' && b.tipo === 'FACHADA') return 1
    return 0
  })

  const ctaHref = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Olá! Tenho interesse no ${empreendimento.nome} em ${empreendimento.bairro}. Pode me dar mais informações?`,
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
          <Link href="/catalogo" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <ChevronLeft size={14} />
            Catálogo
          </Link>
        </div>
      </nav>

      {/* ── SEÇÃO 1: HERO COM GALERIA ── */}
      <section className="px-6 py-10" style={{ background: 'linear-gradient(160deg, #0F1F0F 0%, #080F08 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <GaleriaFotos fotos={fotosOrdenadas} nome={empreendimento.nome} />

          <div className="mt-6 flex flex-col gap-3">
            <span
              className="inline-flex w-fit items-center text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ background: STATUS_COLOR[empreendimento.status] ?? '#E07B3A' }}
            >
              {STATUS_MAP[empreendimento.status] ?? empreendimento.status}
            </span>

            <h1 className="text-3xl md:text-4xl font-black text-[#F7F2EA] leading-tight">
              {empreendimento.nome}
            </h1>

            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin size={14} />
              {empreendimento.bairro} · {empreendimento.cidade}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {empreendimento.incorporadora.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={empreendimento.incorporadora.logo}
                  alt={empreendimento.incorporadora.nome}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <Building2 size={16} className="text-white/50" />
                </span>
              )}
              <span className="text-white/70 text-sm font-medium">{empreendimento.incorporadora.nome}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 2: INFORMAÇÕES PRINCIPAIS ── */}
      <section className="px-6 py-16" style={{ background: '#F7F2EA' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Preço</p>
              <p className="text-[#1E3A1E] font-bold text-lg">A partir de {fmtPreco(empreendimento.precoMin)}</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Tipo</p>
              <p className="text-[#1E3A1E] font-bold text-lg">{TIPO_NEGOCIO_LABEL[empreendimento.tipoNegocio] ?? empreendimento.tipoNegocio}</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Status da obra</p>
              <p className="text-[#1E3A1E] font-bold text-lg">{STATUS_MAP[empreendimento.status] ?? empreendimento.status}</p>
            </div>

            {empreendimento.entregaPrevista && (
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
                <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Entrega prevista</p>
                <p className="text-[#1E3A1E] font-bold text-lg flex items-center gap-1.5">
                  <Calendar size={16} />
                  {empreendimento.entregaPrevista}
                </p>
              </div>
            )}

            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">FGTS</p>
              <p className="text-[#1E3A1E] font-bold text-lg flex items-center gap-1.5">
                {empreendimento.aceitaFgts ? (
                  <>
                    <CheckCircle size={16} style={{ color: '#10b981' }} /> Aceita
                  </>
                ) : (
                  <>
                    <XCircle size={16} style={{ color: '#94a3b8' }} /> Não aceita
                  </>
                )}
              </p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
              <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Financiamento</p>
              <p className="text-[#1E3A1E] font-bold text-lg flex items-center gap-1.5">
                {empreendimento.aceitaFinanciamento ? (
                  <>
                    <CheckCircle size={16} style={{ color: '#10b981' }} /> Aceita
                  </>
                ) : (
                  <>
                    <XCircle size={16} style={{ color: '#94a3b8' }} /> Não aceita
                  </>
                )}
              </p>
            </div>

            {empreendimento.programaMcmv && (
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}>
                <p className="text-[#1E3A1E]/50 text-xs font-medium uppercase tracking-wide mb-1">Programa MCMV</p>
                <p className="text-[#1E3A1E] font-bold text-lg flex items-center gap-1.5">
                  <CheckCircle size={16} style={{ color: '#10b981' }} /> Participante
                </p>
              </div>
            )}
          </div>

          {/* ── SEÇÃO 3: DESCRIÇÃO ── */}
          <div className="mt-12">
            {empreendimento.descricaoCompleta ? (
              <div className="prose-blog">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-[#1E3A1E] mt-6 mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold text-[#1E3A1E] mt-5 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold text-[#1E3A1E] mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-[#1E3A1E]/70 leading-relaxed mb-4">{children}</p>,
                    ul: ({ children }) => <ul className="text-[#1E3A1E]/70 pl-5 mb-4 space-y-1.5 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="text-[#1E3A1E]/70 pl-5 mb-4 space-y-1.5 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    strong: ({ children }) => <strong className="text-[#1E3A1E] font-semibold">{children}</strong>,
                  }}
                >
                  {empreendimento.descricaoCompleta}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-[#1E3A1E]/70 leading-relaxed">{empreendimento.destaqueIa}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 4: TIPOLOGIAS / LOTES DISPONÍVEIS ── */}
      {(isLote ? empreendimento.lotes.length > 0 : empreendimento.tipologias.length > 0) && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">
              {isLote ? 'Lotes disponíveis' : 'Opções disponíveis'}
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLote
                ? empreendimento.lotes.map((lote) => (
                    <div
                      key={lote.id}
                      className="rounded-2xl p-6 flex flex-col gap-3"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <LandPlot size={16} />
                        {fmtArea(lote.areaTerreno)}
                      </div>
                      {lote.frente != null && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Ruler size={16} />
                          {fmtArea(lote.frente)} de frente
                        </div>
                      )}
                      <p className="font-bold text-lg mt-2" style={{ color: '#E07B3A' }}>
                        {fmtPreco(lote.preco)}
                      </p>
                    </div>
                  ))
                : empreendimento.tipologias.map((tipologia) => (
                    <div
                      key={tipologia.id}
                      className="rounded-2xl p-6 flex flex-col gap-3"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <BedDouble size={16} />
                        {tipologia.quartos} quarto{tipologia.quartos !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Ruler size={16} />
                        {fmtArea(tipologia.areaPrivativa)}
                      </div>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Car size={16} />
                        {tipologia.vagas} vaga{tipologia.vagas !== 1 ? 's' : ''}
                      </div>
                      <p className="font-bold text-lg mt-2" style={{ color: '#E07B3A' }}>
                        {fmtPreco(tipologia.preco)}
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 5: DIFERENCIAIS ── */}
      {empreendimento.diferenciais.length > 0 && (
        <section className="px-6 py-16" style={{ background: '#F7F2EA' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A1E] mb-8">Diferenciais</h2>
            <div className="flex flex-wrap gap-2">
              {empreendimento.diferenciais.map((d) => (
                <span
                  key={d}
                  className="text-sm font-medium px-4 py-2 rounded-full"
                  style={{ background: 'rgba(224,123,58,0.1)', border: '1px solid rgba(224,123,58,0.25)', color: '#1E3A1E' }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 6: LOCALIZAÇÃO ── */}
      {temLocalizacao && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Localização</h2>
            <div className="w-full h-96 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <MapaEmpreendimento
                nome={empreendimento.nome}
                bairro={empreendimento.bairro}
                latitude={empreendimento.latitude!}
                longitude={empreendimento.longitude!}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 6b: LOTES ASSOCIADOS ── */}
      {empreendimento.lotesAnuncios.length > 0 && (
        <section className="px-6 py-16" style={{ background: '#F7F2EA' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A1E] mb-1">Lotes disponíveis neste loteamento</h2>
            <p className="text-[#1E3A1E]/50 text-sm mb-8">Anunciados por proprietários</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {empreendimento.lotesAnuncios.map((lote) => (
                <div
                  key={lote.id}
                  className="rounded-2xl p-6 flex flex-col gap-3"
                  style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}
                >
                  <div className="flex items-center gap-2 text-[#1E3A1E]/70 text-sm">
                    <LandPlot size={16} />
                    {fmtArea(lote.area)}
                  </div>
                  <p className="font-bold text-lg" style={{ color: '#E07B3A' }}>
                    {fmtPreco(lote.preco)}
                  </p>
                  <Link
                    href={`/lotes/${lote.slug}`}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:opacity-90 text-white"
                    style={{ background: '#E07B3A' }}
                  >
                    Ver lote
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 7: CTA FINAL ── */}
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
            Interessado neste empreendimento?
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
