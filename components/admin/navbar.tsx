'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

export function AdminNavbar() {
  return (
    <nav
      className="text-white px-6 py-4 flex items-center justify-between shadow-md"
      style={{ backgroundColor: '#1a2e44' }}
    >
      <Link href="/admin" className="font-bold text-lg tracking-tight">
        Seu Corretor GO
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/admin/empreendimentos"
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          Empreendimentos
        </Link>
        <Link
          href="/admin/leads"
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          Leads
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Sair
        </button>
      </div>
    </nav>
  )
}
