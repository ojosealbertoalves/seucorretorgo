import Link from 'next/link'
import { MapPin, Shield } from 'lucide-react'
import { YoutubeIcon } from '@/components/icons/youtube-icon'

const FOOTER_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/lotes', label: 'Lotes' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/proprietarios', label: 'Para Proprietários' },
  { href: '/conversar', label: 'Conversar' },
  { href: '/blog', label: 'Blog' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/admin/login', label: 'Admin' },
]

export default function FooterPublica() {
  return (
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
          {FOOTER_LINKS.map(({ href, label }) => (
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white/25 text-xs">
            <Shield size={11} />
            Dados protegidos · LGPD
          </div>
          <a
            href="https://www.youtube.com/@soterrenosgo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Canal YouTube Só Terrenos GO"
            style={{ color: 'rgba(247,242,234,0.5)' }}
            className="hover:text-[#E07B3A] transition-colors duration-200"
          >
            <YoutubeIcon size={20} />
          </a>
        </div>
      </div>
    </footer>
  )
}
