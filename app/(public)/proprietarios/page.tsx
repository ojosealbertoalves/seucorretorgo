import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPinned, Tag, Building2, FileCheck, MessageCircle, MapPin, Shield, HardHat } from 'lucide-react'
import { ServicoCard } from '@/components/proprietarios/servico-card'
import NavbarPublica from '@/components/navbar-publica'

export const metadata: Metadata = {
  title: 'Para Proprietários | Só Terrenos GO',
  description:
    'Serviços de engenharia para proprietários de terrenos e imóveis em Goiânia: viabilidade de loteamentos, venda de terrenos, construção e regularização.',
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5562999999999'

const SERVICES = [
  {
    icon: <MapPinned size={22} style={{ color: '#E07B3A' }} />,
    titulo: 'Tenho uma área e quero fazer um loteamento',
    descricao:
      'Ajudamos a fazer a viabilidade do empreendimento, além do desenvolvimento completo do projeto.',
    mensagemWhatsapp:
      'Olá! Tenho uma área e gostaria de saber mais sobre viabilidade para loteamento.',
  },
  {
    icon: <Tag size={22} style={{ color: '#E07B3A' }} />,
    titulo: 'Tenho uma área e quero vender',
    descricao: 'Fale conosco para que possamos cadastrar e começar a oferecer o seu terreno.',
    mensagemWhatsapp:
      'Olá! Tenho um terreno e gostaria de saber sobre como vendê-lo com vocês.',
  },
  {
    icon: <Building2 size={22} style={{ color: '#E07B3A' }} />,
    titulo: 'Já tenho um terreno e quero construir, para morar ou investir',
    descricao:
      'Trabalhamos em todo o fluxo: da concepção e criação do projeto até a construção e entrega final das chaves. Nosso lema é transparência, prazo, economia, qualidade e segurança para você.',
    mensagemWhatsapp:
      'Olá! Tenho um terreno e quero construir. Gostaria de saber mais sobre o processo.',
  },
  {
    icon: <FileCheck size={22} style={{ color: '#E07B3A' }} />,
    titulo: 'Precisa de outros serviços para seu imóvel ou terreno?',
    descricao:
      'Regularização, serviços de topografia e mais. Trabalhamos com parceiros especializados para deixar seu imóvel pronto para venda.',
    mensagemWhatsapp:
      'Olá! Preciso de ajuda com regularização/topografia do meu imóvel.',
  },
]

export default function ProprietariosPage() {
  const ctaHref = `https://wa.me/${WA}?text=${encodeURIComponent(
    'Olá! Gostaria de saber mais sobre os serviços de engenharia da Só Terrenos GO.',
  )}`

  return (
    <>
      <NavbarPublica active="proprietarios" />

      {/* ── HERO ── */}
      <section
        className="relative pt-20 pb-24 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0F1F0F 0%, #080F08 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(30,58,30,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,30,0.08) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(224,123,58,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white/70 border border-white/15 mb-8"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <HardHat size={13} style={{ color: '#E07B3A' }} />
            Engenharia Civil · Serviços Especializados
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Para{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #E07B3A 0%, #C8612A 100%)' }}
            >
              Proprietários
            </span>
          </h1>

          <p className="text-white/55 text-base md:text-lg leading-relaxed">
            Seja qual for o momento da sua jornada com seu terreno ou imóvel,
            temos a expertise de engenharia para te ajudar.
          </p>
        </div>
      </section>

      {/* ── CARDS DE SERVIÇO ── */}
      <section className="py-24 px-6" style={{ background: '#080F08' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((s) => (
              <ServicoCard key={s.titulo} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA GENÉRICO ── */}
      <section
        className="py-24 px-6 text-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #0F1F0F 0%, #080F08 65%)' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(30,58,30,0.08) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <div className="relative max-w-md mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Não encontrou o que precisa?
          </h2>
          <p className="text-white/40 text-base mb-8">
            Fale diretamente conosco e vamos entender como podemos ajudar.
          </p>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold px-10 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-105"
            style={{
              background: '#E07B3A',
              boxShadow: '0 8px 40px rgba(224,123,58,0.35)',
            }}
          >
            <MessageCircle size={18} />
            Conversar agora
          </a>
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
