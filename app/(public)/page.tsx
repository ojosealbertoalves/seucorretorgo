export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  MessageCircle,
  Building2,
  MapPin,
  Shield,
  PhoneOff,
  Clock,
  Bot,
  Calendar,
  BookOpen,
  Tag,
  ArrowRight,
} from 'lucide-react'
import HomeNavbar from '@/components/home-navbar'
import MapaHero from '@/components/mapa-hero-loader'

const STATUS_LABEL: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto',
}

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 })
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function HomePage() {
  const [pins, empreendimentos, posts] = await Promise.all([
    prisma.empreendimento.findMany({
      where: { ativo: true, latitude: { not: null }, longitude: { not: null } },
      select: { slug: true, nome: true, bairro: true, latitude: true, longitude: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.empreendimento.findMany({
      where: { ativo: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        incorporadora: { select: { nome: true } },
        fotos: { where: { tipo: 'FACHADA' }, orderBy: { ordem: 'asc' }, take: 1 },
      },
    }),
    prisma.post.findMany({
      where: { publicado: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, titulo: true, slug: true, resumo: true, capa: true, categoria: true, createdAt: true },
    }),
  ])

  const mapPins = pins.map((p) => ({
    slug: p.slug,
    nome: p.nome,
    bairro: p.bairro,
    latitude: p.latitude!,
    longitude: p.longitude!,
  }))

  return (
    <>
      <HomeNavbar />

      {/* ── SEÇÃO 1 · HERO DIVIDIDO ── */}
      <section
        className="pt-16 flex flex-col lg:flex-row"
        style={{ background: '#080F08', minHeight: '90vh' }}
      >
        {/* Lado esquerdo */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-16">
          <div className="max-w-xl mx-auto lg:mx-0 w-full">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-7"
              style={{ border: '1px solid #1E3A1E', color: '#E07B3A', background: 'rgba(30,58,30,0.3)' }}
            >
              ✦ A 1ª plataforma de Goiânia e região especializada em terrenos
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-5">
              Encontre seu terreno
              <br />
              <span style={{ color: '#E07B3A' }}>ideal</span> em Goiânia e região
            </h1>

            <p
              className="text-base md:text-lg max-w-lg leading-relaxed mb-8"
              style={{ color: 'rgba(247,242,234,0.7)' }}
            >
              Para comprar, construir ou investir. Somos a plataforma especializada em
              lotes e loteamentos de Goiânia e região — e usamos IA para te ajudar da
              melhor forma possível.
            </p>

            {/* Mini card do Alberto */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: '#E07B3A' }}
                >
                  A
                </div>
                <p className="text-white text-sm font-semibold">
                  Alberto <span className="text-white/40 font-normal">· IA Especialista</span>
                </p>
                <span
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
                  style={{ color: '#34D399', background: 'rgba(16,185,129,0.1)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online agora
                </span>
              </div>

              <div
                className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 mb-3 text-sm leading-relaxed text-white/85"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,58,30,0.5)' }}
              >
                Olá! Sou o Alberto. Me diga o que você procura — tipo de terreno,
                região, orçamento — e vou encontrar as melhores opções para você. 🏡
              </div>

              <Link
                href="/conversar"
                className="block w-full text-left px-3.5 py-3 rounded-lg text-sm text-white/35 mb-3 transition-colors hover:text-white/50"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E3A1E' }}
              >
                Ex: Lote 300m² em condomínio fechado...
              </Link>

              <Link
                href="/conversar"
                className="flex items-center justify-center gap-2 w-full text-white font-semibold px-4 py-3 rounded-lg text-sm transition-all hover:opacity-90"
                style={{ background: '#E07B3A' }}
              >
                <MessageCircle size={16} />
                Conversar com o Alberto →
              </Link>
            </div>

            <p className="text-white/30 text-xs">
              Sem pressão · Sem ligações · Você decide quando falar com um corretor
            </p>
          </div>
        </div>

        {/* Lado direito · mapa */}
        <div className="hidden lg:block flex-1 p-6">
          <div
            className="w-full h-full rounded-xl overflow-hidden"
            style={{ minHeight: '500px', border: '1px solid #1E3A1E' }}
          >
            <MapaHero empreendimentos={mapPins} />
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 2 · CATÁLOGO ── */}
      <section style={{ background: '#0F1F0F' }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#E07B3A' }}>
                Empreendimentos
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Últimos loteamentos cadastrados
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: '#E07B3A' }}
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {empreendimentos.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl aspect-[4/5] flex items-center justify-center"
                  style={{
                    background: '#080F08',
                    border: '1px solid #1E3A1E',
                    backgroundImage:
                      'linear-gradient(rgba(30,58,30,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,30,0.15) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                >
                  <p className="text-white/30 text-sm text-center px-6">Em breve novos empreendimentos</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {empreendimentos.map((e) => {
                const foto = e.fotos[0]
                const isLote = e.tipoNegocio === 'LOTE'
                return (
                  <Link
                    key={e.id}
                    href={`/catalogo/${e.slug}`}
                    className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-[#1E3A1E] hover:border-[#E07B3A]"
                    style={{ background: '#080F08' }}
                  >
                    <div className="relative aspect-video" style={{ background: '#0F1F0F' }}>
                      {foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={foto.url} alt={e.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/15 text-4xl">
                          🏘
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ background: 'rgba(224,123,58,0.9)' }}
                        >
                          {STATUS_LABEL[e.status] ?? e.status}
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ background: 'rgba(15,31,15,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                          {isLote ? 'Lote' : 'Imóvel'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-white font-bold text-base mb-1">
                        {e.nome}
                      </h3>
                      <p className="text-white/40 text-sm mb-3">
                        {e.incorporadora.nome} · {e.bairro}
                      </p>
                      <p className="text-sm font-semibold mb-3" style={{ color: '#E07B3A' }}>
                        A partir de {fmtPreco(e.precoMin)}
                      </p>
                      {e.diferenciais.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {e.diferenciais.slice(0, 2).map((d) => (
                            <span
                              key={d}
                              className="text-xs px-2.5 py-1 rounded-full text-white/60"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        className="text-sm font-semibold text-center py-2.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(224,123,58,0.12)', color: '#E07B3A' }}
                      >
                        Ver empreendimento
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <p className="text-center mt-10">
            <Link
              href="/lotes"
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Procurando um lote avulso? Veja nosso catálogo de lotes →
            </Link>
          </p>
        </div>
      </section>

      {/* ── SEÇÃO 3 · COMO FUNCIONA ── */}
      <section
        id="como-funciona"
        className="py-28 px-6"
        style={{ background: '#F7F2EA' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#E07B3A' }}>
              Como funciona
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A1E]">
              Simples assim
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative items-start">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+3rem)] right-[calc(16.67%+3rem)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(224,123,58,0.3), transparent)' }}
            />

            {/* ── STEP 1 + chat preview ── */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-5 relative group cursor-default">
                <span
                  className="text-7xl font-black leading-none bg-clip-text text-transparent select-none"
                  style={{ backgroundImage: 'linear-gradient(135deg, #E07B3A 0%, #C8612A 100%)' }}
                >
                  1
                </span>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 z-10"
                  style={{ background: 'rgba(224,123,58,0.12)', border: '1px solid rgba(30,58,30,0.12)' }}
                >
                  <MessageCircle size={22} className="text-[#1E3A1E]/70" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1E3A1E] mb-2">Explore e converse</h3>
                  <p className="text-[#1E3A1E]/60 text-sm leading-relaxed">
                    Navegue pelo catálogo sem pressão ou converse direto com o Alberto. Basta dizer o que procura — nossa IA busca no catálogo e apresenta as melhores opções para você.
                  </p>
                </div>
              </div>

              {/* Chat preview mockup */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1px solid rgba(30,58,30,0.12)' }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2.5 border-b"
                  style={{ background: 'rgba(30,58,30,0.06)', borderColor: 'rgba(30,58,30,0.12)' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: '#E07B3A' }}
                  >
                    A
                  </div>
                  <span className="text-[#1E3A1E]/60 text-xs font-medium">Alberto</span>
                  <span className="ml-auto flex items-center gap-1.5 text-emerald-600 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    Online
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex justify-end">
                    <div
                      className="px-3 py-2 rounded-2xl rounded-tr-sm text-white text-xs leading-relaxed"
                      style={{
                        background: '#E07B3A',
                        boxShadow: '0 4px 14px rgba(224,123,58,0.22)',
                        maxWidth: '88%',
                      }}
                    >
                      Quero um lote de 300m² em condomínio fechado, próximo ao Jardim Goiás, até R$ 800 mil
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: '#E07B3A' }}
                    >
                      A
                    </div>
                    <div
                      className="px-3 py-2 rounded-2xl rounded-tl-sm text-white/90 text-xs leading-relaxed"
                      style={{
                        background: '#0F1F0F',
                        border: '1px solid rgba(30,58,30,0.3)',
                        maxWidth: '80%',
                      }}
                    >
                      Encontrei 3 loteamentos perfeitos para você! 🏡
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── STEP 2 ── */}
            <div className="flex flex-col items-center text-center gap-5 relative group cursor-default">
              <span
                className="text-7xl font-black leading-none bg-clip-text text-transparent select-none"
                style={{ backgroundImage: 'linear-gradient(135deg, #E07B3A 0%, #C8612A 100%)' }}
              >
                2
              </span>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 z-10"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(30,58,30,0.12)' }}
              >
                <Bot size={22} className="text-[#1E3A1E]/70" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1E3A1E] mb-2">Tire todas as dúvidas</h3>
                <p className="text-[#1E3A1E]/60 text-sm leading-relaxed">
                  O Alberto te conta tudo sobre cada empreendimento: diferenciais, localização, plantas disponíveis, formas de pagamento. Compare quantas opções quiser, no seu tempo.
                </p>
              </div>
            </div>

            {/* ── STEP 3 ── */}
            <div className="flex flex-col items-center text-center gap-5 relative group cursor-default">
              <span
                className="text-7xl font-black leading-none bg-clip-text text-transparent select-none"
                style={{ backgroundImage: 'linear-gradient(135deg, #E07B3A 0%, #C8612A 100%)' }}
              >
                3
              </span>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 z-10"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(30,58,30,0.12)' }}
              >
                <Calendar size={22} className="text-[#1E3A1E]/70" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1E3A1E] mb-2">Fale com o corretor quando quiser</h3>
                <p className="text-[#1E3A1E]/60 text-sm leading-relaxed">
                  Decidiu? Conecte-se com o corretor apenas para agendar uma visita ou tirar dúvidas finais. Nada de ligações ou mensagens não solicitadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 4 · DIFERENCIAIS ── */}
      <section
        id="diferenciais"
        className="py-28 px-6"
        style={{ background: '#080F08' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#E07B3A' }}>
              Diferenciais
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F7F2EA]">
              Por que diferente?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: PhoneOff,
                title: 'Sem corretor insistente',
                desc: 'Nada de ligações não solicitadas ou pressão para fechar. Você tem o controle total.',
                color: '#E07B3A',
              },
              {
                icon: Clock,
                title: 'IA disponível 24h',
                desc: 'O Alberto responde a qualquer hora, todos os dias. Explore quando você quiser.',
                color: '#3b82f6',
              },
              {
                icon: Building2,
                title: 'Lotes e loteamentos selecionados',
                desc: 'Com opção de imóveis novos. Só incorporadoras verificadas. Nada de imóvel usado.',
                color: '#10b981',
              },
              {
                icon: MapPin,
                title: 'Especialista local',
                desc: 'Foco total em Goiânia e região. Conhecemos cada bairro e cada lançamento.',
                color: '#a855f7',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="rounded-2xl p-7"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-base font-semibold text-[#F7F2EA] mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 5 · BLOG ── */}
      {posts.length > 0 && (
        <section style={{ background: '#0F1F0F' }} className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Conteúdo sobre o mercado de terrenos
              </h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: '#E07B3A' }}
              >
                Ver todos os artigos <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{ background: '#080F08', border: '1px solid #1E3A1E' }}
                >
                  <div className="w-full h-44 overflow-hidden relative" style={{ background: '#0F1F0F' }}>
                    {post.capa ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.capa}
                        alt={post.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={32} className="text-white/15" />
                      </div>
                    )}
                    {post.categoria && (
                      <span
                        className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 text-white"
                        style={{ background: 'rgba(224,123,58,0.85)' }}
                      >
                        <Tag size={10} />
                        {post.categoria}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-white/30 text-xs mb-2">{fmtDate(post.createdAt)}</p>
                    <h3 className="text-white font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#E07B3A] transition-colors">
                      {post.titulo}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2 flex-1">{post.resumo}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: '#E07B3A' }}>
                      Ler artigo <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 6 · CTA NEWSLETTER ── */}
      <section style={{ background: '#1E3A1E' }} className="py-16 px-6 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Receba novidades sobre terrenos em Goiânia
          </h2>
          <p className="text-white/60 text-base mb-8">
            Lançamentos, análises de mercado e oportunidades — direto no seu e-mail e WhatsApp.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-105"
            style={{ background: '#E07B3A', boxShadow: '0 8px 30px rgba(224,123,58,0.35)' }}
          >
            Cadastrar na newsletter
          </Link>
        </div>
      </section>

      {/* ── SEÇÃO 7 · FOOTER ── */}
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
                <span
                  className="absolute bottom-0 left-0 w-0 h-px bg-white/40 transition-all duration-200 group-hover:w-full"
                />
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
