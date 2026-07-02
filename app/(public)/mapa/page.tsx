export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { MapPin, Shield } from 'lucide-react'
import MapaCatalogo from '@/components/mapa-catalogo-loader'

export const metadata: Metadata = {
  title: 'Mapa de Empreendimentos | Só Terrenos GO',
  description: 'Veja no mapa todos os lotes, loteamentos e imóveis disponíveis em Goiânia e região.',
}

export default async function MapaPage() {
  const empreendimentos = await prisma.empreendimento.findMany({
    where: {
      ativo: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      slug: true,
      nome: true,
      bairro: true,
      precoMin: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const pins = empreendimentos.map((e) => ({
    slug: e.slug,
    nome: e.nome,
    bairro: e.bairro,
    precoMin: e.precoMin,
    latitude: e.latitude!,
    longitude: e.longitude!,
  }))

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080F08' }}>
      {/* ── NAVBAR ── */}
      <nav
        className="sticky top-0 z-50 h-16 flex items-center px-6 border-b shrink-0"
        style={{ background: 'rgba(15,31,15,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E07B3A' }}>
              <MapPin size={14} className="text-white" />
            </span>
            <span style={{ fontWeight: 700, color: 'white' }}>Só Terrenos</span>
            <span style={{ fontWeight: 700, color: '#E07B3A' }}>GO</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalogo" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
              Catálogo
            </Link>
            <Link href="/mapa" className="text-white text-sm font-medium">
              Mapa
            </Link>
            <Link href="/proprietarios" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
              Para Proprietários
            </Link>
            <Link href="/blog" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
              Blog
            </Link>
          </div>

          <Link
            href="/conversar"
            className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: '#E07B3A' }}
          >
            Falar com o Alberto
          </Link>
        </div>
      </nav>

      {/* ── TÍTULO ── */}
      <div className="max-w-6xl mx-auto w-full px-6 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-[#F7F2EA]">Mapa de Empreendimentos</h1>
        <p className="text-white/50 text-sm mt-1">
          {pins.length} empreendimento{pins.length !== 1 ? 's' : ''} em Goiânia e região
        </p>
      </div>

      {/* ── MAPA ── */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-6xl mx-auto w-full h-[70vh] rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {pins.length > 0 ? (
            <MapaCatalogo empreendimentos={pins} />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-white/30 text-sm">Nenhum empreendimento com localização cadastrada.</span>
            </div>
          )}
        </div>
      </div>

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
