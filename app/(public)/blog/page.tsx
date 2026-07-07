export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Mail, BookOpen, Tag, ArrowRight } from 'lucide-react'
import NavbarPublica from '@/components/navbar-publica'

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const CATEGORIA_BADGE: Record<string, { bg: string; color: string }> = {
  Macro: { bg: '#1E3A6E', color: '#8AB4F8' },
  Micro: { bg: '#1E3A1E', color: '#E07B3A' },
  'Dicas da Cidade': { bg: '#2D1B4E', color: '#A78BFA' },
}
const CATEGORIA_BADGE_DEFAULT = { bg: '#1A1A1A', color: '#888' }

function categoriaBadgeStyle(categoria: string) {
  return CATEGORIA_BADGE[categoria] ?? CATEGORIA_BADGE_DEFAULT
}

export const metadata = {
  title: 'Blog · Só Terrenos GO',
  description: 'Dicas, análises e novidades do mercado imobiliário de Goiânia.',
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { publicado: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, titulo: true, slug: true, resumo: true, capa: true, categoria: true, createdAt: true },
  })

  return (
    <div className="min-h-screen" style={{ background: '#080F08' }}>
      <NavbarPublica active="blog" ctaHref="/newsletter" ctaLabel="Newsletter" />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#E07B3A' }}>Blog</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Mercado imobiliário<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #E07B3A 0%, #C8612A 100%)' }}
            >
              de Goiânia
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-xl">
            Dicas, análises e novidades do mercado imobiliário para você tomar a melhor decisão.
          </p>
        </div>

        {/* Newsletter banner */}
        <div
          className="rounded-2xl p-6 mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(224,123,58,0.12) 0%, rgba(224,123,58,0.06) 100%)', border: '1px solid rgba(224,123,58,0.2)' }}
        >
          <div className="flex items-start gap-3">
            <Mail size={20} className="mt-0.5 shrink-0" style={{ color: '#E07B3A' }} />
            <div>
              <p className="text-white font-semibold text-sm">Receba novidades em primeira mão</p>
              <p className="text-white/50 text-sm mt-0.5">Quer receber dicas e novidades do mercado imobiliário de Goiânia direto no seu e-mail e WhatsApp?</p>
            </div>
          </div>
          <Link
            href="/newsletter"
            className="shrink-0 inline-flex items-center gap-1.5 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: '#E07B3A' }}
          >
            Quero receber
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={40} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-base">Nenhum post publicado ainda.</p>
            <p className="text-white/25 text-sm mt-1">Volte em breve!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Capa */}
                <div className="w-full h-44 overflow-hidden relative bg-gray-900">
                  {post.capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.capa}
                      alt={post.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(224,123,58,0.1), rgba(224,123,58,0.05))' }}
                    >
                      <BookOpen size={32} className="text-white/15" />
                    </div>
                  )}
                  {post.categoria && (
                    <span
                      className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ background: categoriaBadgeStyle(post.categoria).bg, color: categoriaBadgeStyle(post.categoria).color }}
                    >
                      <Tag size={10} />
                      {post.categoria}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-white/30 text-xs mb-2">{fmtDate(post.createdAt)}</p>
                  <h2 className="text-white font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#E07B3A] transition-colors">
                    {post.titulo}
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-3 flex-1">{post.resumo}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: '#E07B3A' }}>
                    Ler mais <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer newsletter banner */}
      {posts.length > 0 && (
        <div className="border-t mt-16" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#080F08' }}>
          <div className="max-w-5xl mx-auto px-6 py-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#E07B3A' }}>Newsletter</p>
            <h2 className="text-2xl font-bold text-white mb-2">Fique por dentro do mercado</h2>
            <p className="text-white/40 text-sm mb-6">Lançamentos, dicas de financiamento e análises — sem spam.</p>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3 rounded-2xl transition-all hover:opacity-90"
              style={{ background: '#E07B3A', boxShadow: '0 8px 30px rgba(224,123,58,0.3)' }}
            >
              <Mail size={16} />
              Assinar newsletter
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
