export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { MapPin, Tag, ChevronLeft, Mail, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findFirst({ where: { slug, publicado: true }, select: { titulo: true, resumo: true, capa: true } })
  if (!post) return { title: 'Post não encontrado' }
  return {
    title: `${post.titulo} · Blog Só Terrenos GO`,
    description: post.resumo,
    openGraph: post.capa ? { images: [post.capa] } : undefined,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findFirst({ where: { slug, publicado: true } })
  if (!post) notFound()

  return (
    <div className="min-h-screen" style={{ background: '#1A2E1A' }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 h-16 flex items-center px-6 border-b"
        style={{ background: 'rgba(26,46,26,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-base tracking-tight">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#C4622D' }}>
              <MapPin size={14} className="text-white" />
            </span>
            <span style={{ fontWeight: 700 }}>Só Terrenos</span>
            <span style={{ color: '#C4622D', fontWeight: 700 }}>GO</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <ChevronLeft size={14} />
            Blog
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/30 text-xs mb-8">
          <Link href="/" className="hover:text-white/60 transition-colors">Início</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-white/50 truncate max-w-xs">{post.titulo}</span>
        </div>

        {/* Category + date */}
        <div className="flex items-center gap-3 mb-4">
          {post.categoria && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ background: 'rgba(196,98,45,0.8)' }}
            >
              <Tag size={10} />
              {post.categoria}
            </span>
          )}
          <span className="text-white/30 text-sm">{fmtDate(post.createdAt)}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6">{post.titulo}</h1>

        {/* Summary */}
        <p className="text-white/60 text-lg leading-relaxed mb-8 border-l-4 pl-4" style={{ borderColor: '#C4622D' }}>
          {post.resumo}
        </p>

        {/* Cover image */}
        {post.capa && (
          <div className="rounded-2xl overflow-hidden mb-10 w-full h-72 md:h-96">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.capa} alt={post.titulo} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="prose-blog">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-7 mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-6 mb-2">{children}</h3>,
              p: ({ children }) => <p className="text-white/70 leading-relaxed mb-4">{children}</p>,
              ul: ({ children }) => <ul className="text-white/70 pl-5 mb-4 space-y-1.5 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="text-white/70 pl-5 mb-4 space-y-1.5 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-white/80 italic">{children}</em>,
              blockquote: ({ children }) => (
                <blockquote
                  className="border-l-4 pl-4 my-6 text-white/60 italic"
                  style={{ borderColor: '#C4622D' }}
                >
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: 'rgba(196,98,45,0.1)', color: '#D4794A' }}>
                  {children}
                </code>
              ),
              img: ({ src, alt }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt ?? ''} className="rounded-xl w-full my-6 object-cover" />
              ),
              hr: () => <hr className="my-8 border-white/10" />,
              a: ({ href, children }) => (
                <a href={href} className="underline underline-offset-2 transition-colors" style={{ color: '#D4794A' }}>
                  {children}
                </a>
              ),
            }}
          >
            {post.conteudo}
          </ReactMarkdown>
        </div>

        {/* Newsletter CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(196,98,45,0.1) 0%, rgba(212,121,74,0.05) 100%)', border: '1px solid rgba(196,98,45,0.2)' }}
        >
          <Mail size={28} className="mx-auto mb-3" style={{ color: '#D4794A' }} />
          <h2 className="text-white font-bold text-xl mb-2">Gostou do conteúdo?</h2>
          <p className="text-white/50 text-sm mb-6">
            Receba novidades e dicas do mercado imobiliário de Goiânia direto no seu e-mail e WhatsApp.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3 rounded-2xl transition-all hover:opacity-90"
            style={{ background: '#C4622D', boxShadow: '0 8px 30px rgba(196,98,45,0.3)' }}
          >
            Assinar newsletter
            <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    </div>
  )
}
