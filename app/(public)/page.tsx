'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  Search,
  Bot,
  Calendar,
  PhoneOff,
  Clock,
  Building2,
  MapPin,
  ChevronDown,
  Home,
  Zap,
  Shield,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,22,40,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        }}
      >
        <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-base tracking-tight select-none">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#f97316' }}
            >
              <Home size={14} className="text-white" />
            </span>
            Seu Corretor GO
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#como-funciona"
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Como funciona
            </a>
            <a
              href="#diferenciais"
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Diferenciais
            </a>
            <Link
              href="/catalogo"
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Catálogo
            </Link>
            <Link
              href="/proprietarios"
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Para Proprietários
            </Link>
            <Link
              href="/blog"
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Blog
            </Link>
          </div>

          <Link
            href="/admin/login"
            className="text-white/50 hover:text-white/90 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border border-white/15 hover:border-white/35"
          >
            Acesso admin
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-16"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #1a2e44 50%, #0d2137 100%)' }}
      >
        {/* Animated grid */}
        <div
          className="absolute inset-0 pointer-events-none animate-grid"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Orange glow blob */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Badge */}
        <div className="relative mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white/70 border border-white/15"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span className="relative flex w-1.5 h-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400" />
          </span>
          Goiânia e Região · Especialista em Lotes e Loteamentos
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-3xl mb-6">
          O corretor do futuro.
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' }}
          >
            Sem pressão. Sem ligações.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative text-white/55 text-base md:text-lg max-w-xl leading-relaxed mb-10">
          Especialista em lotes e loteamentos em condomínios fechados em Goiânia.
          Converse com o Alberto, nossa IA, explore terrenos, compare opções e decida
          no seu ritmo — fale com um corretor apenas se quiser agendar uma visita.
        </p>

        {/* CTA buttons */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-4">
          <Link
            href="/conversar"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-105"
            style={{
              background: '#f97316',
              boxShadow: '0 8px 40px rgba(249,115,22,0.4)',
            }}
          >
            <MessageCircle size={18} />
            Conversar com o Alberto
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-8 py-4 rounded-2xl text-base border border-white/25 hover:border-white/50 hover:bg-white/5 transition-all duration-200"
          >
            <Search size={18} />
            Ver catálogo
          </Link>
        </div>

        {/* Sub-CTA support line */}
        <p className="relative text-white/30 text-xs mb-8">
          Também trabalhamos com imóveis novos selecionados
        </p>

        {/* Stats */}
        <div className="relative flex items-center gap-4 text-white/35 text-sm flex-wrap justify-center">
          <span>24h disponível</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>100% sem pressão</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Só Goiânia</span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-0.5 text-white/25 animate-bounce">
          <ChevronDown size={16} />
          <ChevronDown size={16} className="-mt-2.5 opacity-50" />
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section
        id="como-funciona"
        className="py-28 px-6"
        style={{ background: '#0d1624' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Como funciona
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Simples assim
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative items-start">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+3rem)] right-[calc(16.67%+3rem)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.25), transparent)' }}
            />

            {/* ── STEP 1 + chat preview ── */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-5 relative group cursor-default">
                <span
                  className="text-7xl font-black leading-none bg-clip-text text-transparent select-none"
                  style={{ backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' }}
                >
                  1
                </span>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 z-10"
                  style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <MessageCircle size={22} className="text-white/70" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-2">Explore e converse</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Navegue pelo catálogo sem pressão ou converse direto com o Alberto. Basta dizer o que procura — nossa IA busca no catálogo e apresenta as melhores opções para você.
                  </p>
                </div>
              </div>

              {/* Chat preview mockup */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2.5 border-b"
                  style={{ background: 'rgba(10,22,40,0.6)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                  >
                    A
                  </div>
                  <span className="text-white/60 text-xs font-medium">Alberto</span>
                  <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Online
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex justify-end">
                    <div
                      className="px-3 py-2 rounded-2xl rounded-tr-sm text-white text-xs leading-relaxed"
                      style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        boxShadow: '0 4px 14px rgba(249,115,22,0.22)',
                        maxWidth: '88%',
                      }}
                    >
                      Quero um lote de 300m² em condomínio fechado, no Jardim Goiás, até R$ 400 mil
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                    >
                      A
                    </div>
                    <div
                      className="px-3 py-2 rounded-2xl rounded-tl-sm text-white/90 text-xs leading-relaxed"
                      style={{
                        background: '#1a2e44',
                        border: '1px solid rgba(255,255,255,0.06)',
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
                style={{ backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' }}
              >
                2
              </span>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 z-10"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Bot size={22} className="text-white/70" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Tire todas as dúvidas</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  O Alberto te conta tudo sobre cada empreendimento: diferenciais, localização, plantas disponíveis, formas de pagamento. Compare quantas opções quiser, no seu tempo.
                </p>
              </div>
            </div>

            {/* ── STEP 3 ── */}
            <div className="flex flex-col items-center text-center gap-5 relative group cursor-default">
              <span
                className="text-7xl font-black leading-none bg-clip-text text-transparent select-none"
                style={{ backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' }}
              >
                3
              </span>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 z-10"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Calendar size={22} className="text-white/70" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Fale com o corretor quando quiser</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Decidiu? Conecte-se com o corretor apenas para agendar uma visita ou tirar dúvidas finais. Nada de ligações ou mensagens não solicitadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POR QUE LOTES ── */}
      <section
        className="py-28 px-6"
        style={{ background: '#0a1628' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Proposta de valor
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Por que investir em lote?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Home,
                title: 'Construa do seu jeito',
                desc: 'Projete a casa dos seus sonhos, no seu tempo, do zero.',
                color: '#f97316',
              },
              {
                icon: ShieldCheck,
                title: 'Segurança de condomínio',
                desc: 'Portaria 24h, infraestrutura completa e vizinhança selecionada.',
                color: '#10b981',
              },
              {
                icon: TrendingUp,
                title: 'Potencial de valorização',
                desc: 'Terrenos em áreas de expansão de Goiânia com alto potencial.',
                color: '#3b82f6',
              },
              {
                icon: Wallet,
                title: 'Flexibilidade financeira',
                desc: 'Entrada facilitada — parcele o lote e construa quando quiser.',
                color: '#a855f7',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section
        id="diferenciais"
        className="py-28 px-6"
        style={{ background: '#0d1624' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Diferenciais
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Por que diferente?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: PhoneOff,
                title: 'Sem corretor insistente',
                desc: 'Nada de ligações não solicitadas ou pressão para fechar. Você tem o controle total.',
                color: '#f97316',
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
                className="group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        className="py-32 px-6 text-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a2e44 0%, #0a1628 65%)' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        <div className="relative max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium mb-6">
            <Zap size={14} />
            Sem formulários. Só uma conversa.
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Pronto para encontrar
            <br />
            seu lote ou imóvel?
          </h2>
          <p className="text-white/40 mb-10 text-base">
            O Alberto está disponível agora mesmo.
          </p>
          <Link
            href="/conversar"
            className="inline-flex items-center gap-2 text-white font-semibold px-10 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-105"
            style={{
              background: '#f97316',
              boxShadow: '0 8px 40px rgba(249,115,22,0.35)',
            }}
          >
            <MessageCircle size={18} />
            Falar com o Alberto
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060e18' }} className="py-10 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: '#f97316' }}
            >
              <Home size={12} className="text-white" />
            </span>
            <div>
              <p className="text-white/80 font-semibold text-sm leading-tight">Seu Corretor GO</p>
              <p className="text-white/25 text-xs">© 2025 · CRECI-GO</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {[
              { href: '/catalogo', label: 'Catálogo' },
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
