import Link from 'next/link'
import { MapPin, MessageCircle } from 'lucide-react'

type LinkKey = 'catalogo' | 'lotes' | 'mapa' | 'proprietarios' | 'blog'

const LINKS: { key: LinkKey; href: string; label: string }[] = [
  { key: 'catalogo', href: '/catalogo', label: 'Catálogo' },
  { key: 'lotes', href: '/lotes', label: 'Lotes' },
  { key: 'mapa', href: '/mapa', label: 'Mapa' },
  { key: 'proprietarios', href: '/proprietarios', label: 'Para Proprietários' },
  { key: 'blog', href: '/blog', label: 'Blog' },
]

export default function NavbarPublica({
  active,
  ctaHref = '/conversar',
  ctaLabel = 'Falar com o Alberto',
}: {
  active?: LinkKey
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <nav
      className="sticky top-0 z-50 h-16 flex items-center px-6 border-b"
      style={{ background: 'rgba(15,31,15,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight shrink-0">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E07B3A' }}>
            <MapPin size={14} className="text-white" />
          </span>
          <span style={{ fontWeight: 700, color: 'white' }}>Só Terrenos</span>
          <span style={{ fontWeight: 700, color: '#E07B3A' }}>GO</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {LINKS.map(({ key, href, label }) => (
            <Link
              key={key}
              href={href}
              className={
                key === active
                  ? 'text-white text-sm font-medium'
                  : 'text-white/60 hover:text-white text-sm transition-colors'
              }
            >
              {label}
            </Link>
          ))}
        </div>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0"
          style={{ background: '#E07B3A' }}
        >
          <MessageCircle size={13} />
          {ctaLabel}
        </Link>
      </div>
    </nav>
  )
}
