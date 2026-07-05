export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { prisma } from '@/lib/prisma'
import { HeroEmpreendimento } from '@/components/hero-empreendimento'
import { WhatsappStickyCta } from '@/components/whatsapp-sticky-cta'
import MapaEmpreendimento from '@/components/mapa-empreendimento-loader'
import NavbarPublica from '@/components/navbar-publica'
import FooterPublica from '@/components/footer-publica'
import { DescricaoEmpreendimento } from '@/components/descricao-empreendimento'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import {
  MessageCircle,
  CheckCircle2,
  BedDouble,
  Car,
  Ruler,
  LandPlot,
  ArrowRight,
  FolderOpen,
} from 'lucide-react'

const STATUS_MAP: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto para morar',
}

const TIPO_NEGOCIO_LABEL: Record<string, string> = {
  IMOVEL: 'Condomínio Fechado',
  LOTE: 'Loteamento',
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5562999999999'

const infraMarkdownComponents = {
  h2: ({ children }: { children?: ReactNode }) => <h2 className="text-xl font-bold mt-6 mb-2 break-inside-avoid-column" style={{ color: '#E07B3A' }}>{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="text-lg font-semibold mt-4 mb-2 break-inside-avoid-column" style={{ color: '#E07B3A' }}>{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p className="leading-relaxed mb-4 break-inside-avoid-column" style={{ color: 'rgba(247,242,234,0.85)' }}>{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mb-4 space-y-2">{children}</ul>,
  li: ({ children }: { children?: ReactNode }) => (
    <li className="flex items-start gap-2 leading-relaxed break-inside-avoid-column" style={{ color: 'rgba(247,242,234,0.85)' }}>
      <CheckCircle2 size={16} style={{ color: '#10b981' }} className="shrink-0 mt-1" />
      <span>{children}</span>
    </li>
  ),
}

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtArea(v: number) {
  return `${v.toLocaleString('pt-BR')}m²`
}

function stripMarkdown(s: string) {
  return s.replace(/<[^>]+>/g, '').replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim()
}

function getYoutubeEmbedUrl(url: string): string | null {
  const patterns = [
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return `https://www.youtube.com/embed/${m[1]}`
  }
  return null
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
      descricaoCompleta: true,
      ativo: true,
      bairroTexto: true,
      bairro: { select: { nome: true } },
      fotos: { orderBy: { ordem: 'asc' }, take: 1, select: { url: true } },
    },
  })
  if (!empreendimento || !empreendimento.ativo) return { title: 'Empreendimento não encontrado' }

  const bairroNome = empreendimento.bairro?.nome ?? empreendimento.bairroTexto
  const title = bairroNome
    ? `${empreendimento.nome} | ${bairroNome} | Só Terrenos GO`
    : `${empreendimento.nome} | Só Terrenos GO`

  const description = empreendimento.destaqueIa
    || (empreendimento.descricaoCompleta ? stripMarkdown(empreendimento.descricaoCompleta).slice(0, 160) : empreendimento.nome)

  return {
    title,
    description,
    openGraph: empreendimento.fotos[0] ? { title, description, images: [empreendimento.fotos[0].url] } : { title, description },
  }
}

export default async function EmpreendimentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const empreendimento = await getEmpreendimento(slug)

  if (!empreendimento || !empreendimento.ativo) notFound()

  const isLote = empreendimento.tipoNegocio === 'LOTE'
  const temLocalizacao = empreendimento.latitude != null && empreendimento.longitude != null

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

  const embedVideoUrl = empreendimento.videoUrl ? getYoutubeEmbedUrl(empreendimento.videoUrl) : null

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

  const stats: { valor: ReactNode; label: string; color?: string }[] = []
  if (loteAreaMinValido) {
    stats.push({ valor: fmtArea(empreendimento.loteAreaMin!), label: 'Lotes a partir de' })
  }
  if (loteAreaMaxValido) {
    stats.push({ valor: fmtArea(empreendimento.loteAreaMax!), label: 'Até' })
  }
  if (lotePrecoMinValido) {
    stats.push({ valor: fmtPreco(empreendimento.lotePrecoMin!), label: 'A partir de', color: '#E07B3A' })
  }
  if (!isLote && empreendimento.precoMin > 0) {
    stats.push({ valor: fmtPreco(empreendimento.precoMin), label: 'A partir de', color: '#E07B3A' })
  }
  stats.push({ valor: STATUS_MAP[empreendimento.status] ?? empreendimento.status, label: 'Status da obra' })
  stats.push({ valor: TIPO_NEGOCIO_LABEL[empreendimento.tipoNegocio] ?? empreendimento.tipoNegocio, label: 'Tipo' })
  if (empreendimento.entregaPrevista) {
    stats.push({ valor: empreendimento.entregaPrevista, label: 'Entrega prevista' })
  }

  const badges: string[] = []
  if (empreendimento.aceitaFgts) badges.push('Aceita FGTS')
  if (empreendimento.aceitaFinanciamento) badges.push('Aceita financiamento')
  if (empreendimento.programaMcmv) badges.push('Programa MCMV')

  return (
    <>
      <NavbarPublica active="catalogo" />

      {/* ── 1. HERO IMERSIVO ── */}
      <HeroEmpreendimento
        fotos={fotosOrdenadas}
        nome={empreendimento.nome}
        statusLabel={STATUS_MAP[empreendimento.status] ?? empreendimento.status}
        statusColor="#E07B3A"
        incorporadora={empreendimento.incorporadora}
        localizacaoLabel={localizacaoLabel || null}
      />

      {/* ── 2. FAIXA DE NÚMEROS DE IMPACTO ── */}
      <div
        className="px-6 py-6"
        style={{ background: '#0F1F0F', borderTop: '1px solid #1E3A1E', borderBottom: '1px solid #1E3A1E' }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center lg:flex-nowrap">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex-1 min-w-[45%] lg:min-w-0 text-center px-6 py-2 lg:[&:not(:first-child)]:border-l"
              style={{ borderColor: '#1E3A1E' }}
            >
              <p className="font-black text-xl md:text-2xl" style={{ color: s.color ?? '#F7F2EA' }}>
                {s.valor}
              </p>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {badges.length > 0 && (
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2 mt-5">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-white/80"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. SOBRE O EMPREENDIMENTO ── */}
      {temSecaoSobre && (
        <section className="px-6" style={{ background: '#080F08', paddingTop: 80, paddingBottom: 80 }}>
          <div className="max-w-[800px] mx-auto">
            {empreendimento.destaqueIa && (
              <>
                <div className="flex gap-3 items-start">
                  <span className="text-6xl md:text-7xl font-serif leading-none shrink-0" style={{ color: '#E07B3A' }}>
                    &ldquo;
                  </span>
                  <p className="text-xl md:text-2xl italic leading-snug pt-2" style={{ color: '#F7F2EA' }}>
                    {empreendimento.destaqueIa}
                  </p>
                </div>
                <div className="h-px w-full my-10" style={{ background: '#1E3A1E' }} />
              </>
            )}

            {empreendimento.descricaoCompleta && (
              <DescricaoEmpreendimento texto={empreendimento.descricaoCompleta} />
            )}
          </div>
        </section>
      )}

      {/* ── 4. DIFERENCIAIS ── */}
      {empreendimento.diferenciais.length > 0 && (
        <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-1">Por que escolher este empreendimento?</h2>
            <p className="text-white/40 text-sm mb-8">Conheça os principais diferenciais</p>
            <div className="grid md:grid-cols-2 gap-4">
              {empreendimento.diferenciais.map((d) => (
                <div
                  key={d}
                  className="flex items-center gap-3 text-sm font-medium px-5 py-4 rounded-xl transition-colors"
                  style={{ background: '#080F08', border: '1px solid #1E3A1E', color: '#F7F2EA' }}
                >
                  <CheckCircle2 size={20} style={{ color: '#E07B3A' }} className="shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. INFRAESTRUTURA ── */}
      {empreendimento.infraestrutura && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Infraestrutura completa</h2>
            <div className="md:columns-2 md:gap-10">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} components={infraMarkdownComponents}>
                {empreendimento.infraestrutura}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. VÍDEO ── */}
      {embedVideoUrl && (
        <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Conheça o empreendimento</h2>
            <div
              className="max-w-[900px] mx-auto aspect-video rounded-xl overflow-hidden"
              style={{ border: '1px solid #1E3A1E', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            >
              <iframe
                src={embedVideoUrl}
                title={`Vídeo de ${empreendimento.nome}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 7. LOTES DISPONÍVEIS ── */}
      {mostrarSecaoLotes && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Lotes disponíveis</h2>

            {temLotesAgregados ? (
              <div
                className="max-w-xl mx-auto rounded-2xl p-8 flex flex-col items-center text-center gap-3"
                style={{ background: '#0F1F0F', border: '1px solid #E07B3A' }}
              >
                {loteAreaMinValido && (
                  <div className="flex items-center gap-2 text-white text-xl font-bold">
                    <LandPlot size={20} style={{ color: '#E07B3A' }} />
                    Lotes a partir de {fmtArea(empreendimento.loteAreaMin!)}
                  </div>
                )}
                {loteAreaMaxValido && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Ruler size={16} />
                    Até {fmtArea(empreendimento.loteAreaMax!)}
                  </div>
                )}
                {lotePrecoMinValido && (
                  <p className="font-black text-3xl" style={{ color: '#E07B3A' }}>
                    A partir de {fmtPreco(empreendimento.lotePrecoMin!)}
                  </p>
                )}
                <p className="text-white/50 text-sm">Consulte disponibilidade e condições de pagamento</p>
                <Link
                  href="/conversar"
                  className="mt-3 inline-flex w-fit items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90"
                  style={{ background: '#E07B3A' }}
                >
                  <MessageCircle size={16} />
                  Conversar com o Alberto
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {empreendimento.lotes.map((lote) => (
                  <div
                    key={lote.id}
                    className="rounded-2xl p-6 flex flex-col gap-3"
                    style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
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

      {/* ── 7b. OPÇÕES DISPONÍVEIS (IMÓVEIS) ── */}
      {!isLote && empreendimento.tipologias.length > 0 && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-8">Opções disponíveis</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {empreendimento.tipologias.map((tipologia) => (
                <div
                  key={tipologia.id}
                  className="rounded-2xl p-6 flex flex-col gap-3"
                  style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
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

      {/* ── 7c. LOTES ASSOCIADOS (anúncios de proprietários) ── */}
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
                  style={{ background: '#080F08', border: '1px solid #1E3A1E' }}
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

      {/* ── 8. LOCALIZAÇÃO ── */}
      {temLocalizacao && (
        <section className="px-6 py-16" style={{ background: '#0F1F0F' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F7F2EA] mb-1">Localização</h2>
            {localizacaoLabel && <p className="text-white/40 text-sm mb-8">{localizacaoLabel}</p>}
            <div className="w-full h-[400px] rounded-xl overflow-hidden" style={{ border: '1px solid #1E3A1E' }}>
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

      {/* ── 9. DOCUMENTOS (Drive) ── */}
      {empreendimento.driveUrl && (
        <section className="px-6 py-16" style={{ background: '#080F08' }}>
          <div
            className="max-w-lg mx-auto rounded-2xl p-10 flex flex-col items-center text-center gap-3"
            style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
          >
            <FolderOpen size={40} style={{ color: '#E07B3A' }} />
            <h2 className="text-xl font-bold text-[#F7F2EA]">Documentação disponível</h2>
            <p className="text-white/50 text-sm">
              Acesse plantas, memorial descritivo e informações técnicas
            </p>
            <a
              href={empreendimento.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90"
              style={{ background: '#1E3A1E', border: '1px solid #E07B3A' }}
            >
              Acessar documentos →
            </a>
          </div>
        </section>
      )}

      {/* ── 10. CTA FINAL ── */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0F1F0F 0%, #1E3A1E 100%)' }}
      >
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-[#F7F2EA] mb-4 leading-tight">
            Interessado no {empreendimento.nome}?
          </h2>
          <p className="text-white/60 text-base mb-8">
            Converse com o Alberto, nosso assistente, para saber mais sobre este empreendimento.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Link
              href="/conversar"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-105"
              style={{ background: '#E07B3A', boxShadow: '0 8px 40px rgba(224,123,58,0.35)' }}
            >
              <MessageCircle size={18} />
              Conversar com o Alberto →
            </Link>
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors underline underline-offset-2"
            >
              Prefere contato direto? Fale no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <WhatsappStickyCta href="/conversar" label="Conversar com o Alberto" color="#E07B3A" />

      <FooterPublica />
    </>
  )
}
