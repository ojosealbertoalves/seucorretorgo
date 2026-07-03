'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(15,31,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}
    >
      <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight select-none">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#E07B3A' }}
          >
            <MapPin size={14} className="text-white" />
          </span>
          <span style={{ fontWeight: 700, color: 'white' }}>Só Terrenos</span>
          <span style={{ fontWeight: 700, color: '#E07B3A' }}>GO</span>
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
            href="/lotes"
            className="text-white/60 hover:text-white text-sm transition-colors duration-200"
          >
            Lotes
          </Link>
          <Link
            href="/mapa"
            className="text-white/60 hover:text-white text-sm transition-colors duration-200"
          >
            Mapa
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
  )
}
