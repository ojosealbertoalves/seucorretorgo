export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { prisma } from '@/lib/prisma'
import { GaleriaFotos } from '@/components/galeria-fotos'
import MapaEmpreendimento from '@/components/mapa-empreendimento-loader'
import NavbarPublica from '@/components/navbar-publica'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import {
  MapPin,
  MessageCircle,
  Building2,
  Calendar,
  Wallet,
  CheckCircle,
  CheckCircle2,
  XCircle,
  BedDouble,
  Car,
  Ruler,
  LandPlot,
  ArrowRight,
  Shield,
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
  LOTE: 'Loteamento',
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5562999999999'

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => <h1 className="text-2xl font-bold text-[#F7F2EA] mt-6 mb-3">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="text-xl font-bold text-[#F7F2EA] mt-5 mb-2">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="text-lg font-semibold text-[#F7F2EA] mt-4 mb-2">{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p className="leading-relaxed mb-5" style={{ color: 'rgba(247,242,234,0.9)' }}>{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="pl-5 mb-5 space-y-2 list-disc" style={{ color: 'rgba(247,242,234,0.9)' }}>{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="pl-5 mb-5 space-y-2 list-decimal" style={{ color: 'rgba(247,242,234,0.9)' }}>{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="text-[#F7F2EA] font-semibold">{children}</strong>,
}

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
      bairro: { select: { nome: true } },
      cidade: { select: { nome: true } },
    },
  })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const empreendimento = await prisma.empreendimento.findUnique({
    where: { slug },
    select: {
      nome: true,
      destaqueIa: true,
      ativo: true,
      bairroTexto: true,
      cidadeTexto: true,
      bairro: { select: { nome: true } },
      cidade: { select: { nome: true } },
      fotos: { orderBy: { ordem: 'asc' }, take: 1, select: { url: true } },
    },
  })
  if (!empreendimento || !empreendimento.ativo) return { title: 'Empreendimento não encontrado' }

  const bairroNome = empreendimento.bairro?.nome ?? empreendimento.bairroTexto
  const cidadeNome = empreendimento.cidade?.nome ?? empreendimento.cidadeTexto
  const local = [bairroNome, cidadeNome].filter(Boolean).join(', ')

  return {
    title: `${empreendimento.nome} | Só Terrenos GO`,
    description: empreendimento.destaqueIa || (local ? `${empreendimento.nome} em ${local}.` : empreendimento.nome),
    openGraph: empreendimento.fotos[0] ? { images: [empreendimento.fotos[0].url] } : undefined,
  }
}

export default async function EmpreendimentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const empreendimento = await getEmpreendimento(slug)

  if (!empreendimento || !empreendimento.ativo) notFound()

  const isLote = empreendimento.tipoNegocio === 'LOTE'
  const temLocalizacao = empreendimento.latitude != null && empreendimento.longitude != null

  const precoExibir = isLote && empreendimento.lotePrecoMin && empreendimento.lotePrecoMin > 0
    ? empreendimento.lotePrecoMin
    : empreendimento.precoMin
  const temPreco = precoExibir > 0

  const loteAreaMinValido = isLote && (empreendimento.loteAreaMin ?? 0) > 0
  const loteAreaMaxValido = isLote && (empreendimento.loteAreaMax ?? 0) > 0
  const lotePrecoMinValido = isLote && (empreendimento.lotePrecoMin ?? 0) > 0
  const temLotesAgregados = loteAreaMinValido || lotePrecoMinValido
  const temLotesIndividuais = isLote && empreendimento.lotes.length > 0
  const mostrarSecaoLotes = isLote && (temLotesAgregados || temLotesIndividuais)

  const temSecaoSobre = Boolean(empreendimento.descricaoCompleta || empreendimento.destaqueIa)

  const bairroNome = empreendimento.bairro?.nome ?? empreendimento.bairroTexto
  const cidadeNome = empreendimento.cidade?.nome ?? empreendimento.cidadeTexto
  const localizacaoLabel = [bairroNome, cidadeNome].filter(Boolean).join(' · ')

  // Fotos com FACHADA priorizada, mantendo a ordem relativa das demais
  const fotosOrdenadas = [...empreendimento.fotos].sort((a, b) => {
    if (a.tipo === 'FACHADA' && b.tipo !== 'FACHADA') return -1
    if (a.tipo !== 'FACHADA' && b.tipo === 'FACHADA') return 1
    return 0
  })

  const ctaHref = `https://wa.me/${WA}?text=${encodeURIComponent(
    bairroNome
      ? `Olá! Tenho interesse no ${empreendimento.nome} em ${bairroNome}. Pode me dar mais informações?`
      : `Olá! Tenho interesse no ${empreendimento.nome}. Pode me dar mais informações?`,
  )}`

  const ctaLotesHref = `https://wa.me/${WA}?text=${encodeURIComponent(
    bairroNome
      ? `Olá! Tenho interesse nos lotes do ${empreendimento.nome} em ${bairroNome}. Quais estão disponíveis?`
      : `Olá! Tenho interesse nos lotes do ${empreendimento.nome}. Quais estão disponíveis?`,
  )}`

  return (
    <>
      <NavbarPublica active="catalogo" />

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

            {localizacaoLabel && (
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin size={14} />
                {localizacaoLabel}
              </div>
            )}

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
      <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">Preço</p>
              <p className="text-[#F7F2EA] font-bold text-lg">
                {temPreco ? `A partir de ${fmtPreco(precoExibir)}` : 'Consulte valores'}
              </p>
            </div>

            {(loteAreaMinValido || loteAreaMaxValido) && (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">Área dos lotes</p>
                <p className="text-[#F7F2EA] font-bold text-lg">
                  {loteAreaMinValido && `Lotes a partir de ${fmtArea(empreendimento.loteAreaMin!)}`}
                  {loteAreaMinValido && loteAreaMaxValido && ' · '}
                  {loteAreaMaxValido && `Até ${fmtArea(empreendimento.loteAreaMax!)}`}
                </p>
              </div>
            )}

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">Tipo</p>
              <p className="text-[#F7F2EA] font-bold text-lg">{TIPO_NEGOCIO_LABEL[empreendimento.tipoNegocio] ?? empreendimento.tipoNegocio}</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">Status da obra</p>
              <p className="text-[#F7F2EA] font-bold text-lg">{STATUS_MAP[empreendimento.status] ?? empreendimento.status}</p>
            </div>

            {empreendimento.entregaPrevista && (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">Entrega prevista</p>
                <p className="text-[#F7F2EA] font-bold text-lg flex items-center gap-1.5">
                  <Calendar size={16} />
                  {empreendimento.entregaPrevista}
                </p>
              </div>
            )}

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">FGTS</p>
              <p className="text-[#F7F2EA] font-bold text-lg flex items-center gap-1.5">
                {empreendimento.aceitaFgts ? (
                  <>
                    <CheckCircle size={16} style={{ color: '#10b981' }} /> Aceita
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-white/30" /> Não aceita
                  </>
                )}
              </p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">Financiamento</p>
              <p className="text-[#F7F2EA] font-bold text-lg flex items-center gap-1.5">
                {empreendimento.aceitaFinanciamento ? (
                  <>
                    <CheckCircle size={16} style={{ color: '#10b981' }} /> Aceita
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-white/30" /> Não aceita
                  </>
                )}
              </p>
            </div>

            {empreendimento.programaMcmv && (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">Programa MCMV</p>
                <p className="text-[#F7F2EA] font-bold text-lg flex items-center gap-1.5">
                  <CheckCircle size={16} style={{ color: '#10b981' }} /> Participante
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 3: SOBRE O EMPREENDIMENTO ── */}
      {temSecaoSobre && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Sobre o empreendimento</h2>

            {empreendimento.destaqueIa && (
              <p className="text-xl md:text-2xl font-bold mb-6 leading-snug" style={{ color: '#E07B3A' }}>
                &ldquo;{empreendimento.destaqueIa}&rdquo;
              </p>
            )}

            {empreendimento.descricaoCompleta && (
              <div className="prose-blog">
                <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                  {empreendimento.descricaoCompleta}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SEÇÃO 4: DIFERENCIAIS ── */}
      {empreendimento.diferenciais.length > 0 && (
        <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Diferenciais</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {empreendimento.diferenciais.map((d) => (
                <div
                  key={d}
                  className="flex items-center gap-2.5 text-sm font-medium px-4 py-3 rounded-xl"
                  style={{ background: '#1E3A1E', border: '1px solid rgba(224,123,58,0.3)', color: '#F7F2EA' }}
                >
                  <CheckCircle2 size={18} style={{ color: '#E07B3A' }} className="shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 5: INFRAESTRUTURA ── */}
      {empreendimento.infraestrutura && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Infraestrutura</h2>
            <div className="prose-blog">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                {empreendimento.infraestrutura}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 6: LOTES DISPONÍVEIS / OPÇÕES DISPONÍVEIS ── */}
      {mostrarSecaoLotes && (
        <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Lotes disponíveis</h2>

            {temLotesAgregados ? (
              <div
                className="rounded-2xl p-8 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {loteAreaMinValido && (
                  <div className="flex items-center gap-2 text-white text-lg font-semibold">
                    <LandPlot size={18} style={{ color: '#E07B3A' }} />
                    Lotes a partir de {fmtArea(empreendimento.loteAreaMin!)}
                  </div>
                )}
                {loteAreaMaxValido && (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Ruler size={16} />
                    Até {fmtArea(empreendimento.loteAreaMax!)}
                  </div>
                )}
                {lotePrecoMinValido && (
                  <p className="font-bold text-2xl" style={{ color: '#E07B3A' }}>
                    A partir de {fmtPreco(empreendimento.lotePrecoMin!)}
                  </p>
                )}
                <a
                  href={ctaLotesHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-fit items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90"
                  style={{ background: '#E07B3A' }}
                >
                  <MessageCircle size={16} />
                  Consultar disponibilidade
                </a>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {empreendimento.lotes.map((lote) => (
                  <div
                    key={lote.id}
                    className="rounded-2xl p-6 flex flex-col gap-3"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {lote.areaTerreno > 0 && (
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <LandPlot size={16} />
                        {fmtArea(lote.areaTerreno)}
                      </div>
                    )}
                    {lote.frente != null && lote.frente > 0 && (
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Ruler size={16} />
                        {fmtArea(lote.frente)} de frente
                      </div>
                    )}
                    <p className="font-bold text-lg mt-2" style={{ color: '#E07B3A' }}>
                      {lote.preco > 0 ? fmtPreco(lote.preco) : 'Consulte valores'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SEÇÃO 7: OPÇÕES DISPONÍVEIS (IMÓVEIS) ── */}
      {!isLote && empreendimento.tipologias.length > 0 && (
        <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Opções disponíveis</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {empreendimento.tipologias.map((tipologia) => (
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
                    {tipologia.preco > 0 ? fmtPreco(tipologia.preco) : 'Consulte valores'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 8: LOCALIZAÇÃO ── */}
      {temLocalizacao && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Localização</h2>
            <div className="w-full h-96 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <MapaEmpreendimento
                nome={empreendimento.nome}
                bairro={bairroNome ?? ''}
                latitude={empreendimento.latitude!}
                longitude={empreendimento.longitude!}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 8b: LOTES ASSOCIADOS ── */}
      {empreendimento.lotesAnuncios.length > 0 && (
        <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-1">Lotes disponíveis neste loteamento</h2>
            <p className="text-white/40 text-sm mb-8">Anunciados por proprietários</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {empreendimento.lotesAnuncios.map((lote) => (
                <div
                  key={lote.id}
                  className="rounded-2xl p-6 flex flex-col gap-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <LandPlot size={16} />
                    {fmtArea(lote.area)}
                  </div>
                  <p className="font-bold text-lg" style={{ color: '#E07B3A' }}>
                    {lote.preco > 0 ? fmtPreco(lote.preco) : 'Consulte valores'}
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

      {/* ── SEÇÃO 9: CTA FINAL ── */}
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

      {/* ── FOOTER ── */}
      <footer style={{ background: '#080F08' }} className="py-10 px-6 border-t border-white/5">
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
    </>
  )
}
