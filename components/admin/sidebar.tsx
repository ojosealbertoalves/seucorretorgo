'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Building2, Landmark, Users, LogOut, Sparkles, BookOpen, Mail, LandPlot, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/empreendimentos', label: 'Empreendimentos', icon: Building2, exact: false },
  { href: '/admin/lotes', label: 'Lotes', icon: LandPlot, exact: false },
  { href: '/admin/incorporadoras', label: 'Incorporadoras', icon: Landmark, exact: false },
  { href: '/admin/cidades', label: 'Cidades e Bairros', icon: MapPin, exact: false },
  { href: '/admin/leads', label: 'Leads', icon: Users, exact: false },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen, exact: false },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col w-64 min-h-screen shrink-0"
      style={{ backgroundColor: '#0F1F0F', borderRight: '1px solid #1E3A1E' }}
    >
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-white font-bold text-lg tracking-tight">
          <span style={{ fontWeight: 700, color: 'white' }}>Só Terrenos</span>{' '}
          <span style={{ fontWeight: 700, color: '#E07B3A' }}>GO</span>
        </h1>
        <p className="text-white/50 text-xs mt-0.5">Painel Administrativo</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <div key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
                style={isActive ? { backgroundColor: '#E07B3A' } : undefined}
              >
                <Icon size={18} />
                {label}
              </Link>

              {/* Sub-item: Importar via IA under Empreendimentos */}
              {href === '/admin/empreendimentos' && pathname.startsWith('/admin/empreendimentos') && (
                <Link
                  href="/admin/empreendimentos/importar"
                  className={cn(
                    'flex items-center gap-3 pl-9 pr-3 py-1.5 rounded-lg text-xs transition-colors mt-0.5',
                    pathname.startsWith('/admin/empreendimentos/importar')
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/50 hover:bg-white/10 hover:text-white/80'
                  )}
                >
                  <Sparkles size={13} />
                  Importar via IA
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
