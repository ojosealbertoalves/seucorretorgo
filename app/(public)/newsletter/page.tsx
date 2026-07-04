'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import NavbarPublica from '@/components/navbar-publica'

const BENEFITS = [
  'Dicas exclusivas sobre financiamento e compra de imóveis',
  'Lançamentos em primeira mão, antes de irem ao público',
  'Análises do mercado imobiliário de Goiânia e região',
  'Conteúdo direto no seu WhatsApp e e-mail',
]

export default function NewsletterPage() {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome || !form.email || !form.whatsapp) {
      setError('Preencha todos os campos.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao cadastrar. Tente novamente.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0F1F0F 0%, #080F08 100%)' }}
    >
      <NavbarPublica active="blog" ctaHref="/blog" ctaLabel="Ver blog" />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
                style={{ background: 'rgba(224,123,58,0.08)', border: '1px solid rgba(224,123,58,0.3)', color: '#E07B3A' }}>
                <Mail size={12} />
                Newsletter Gratuita
              </div>
              <h1 className="text-4xl font-black text-white leading-tight mb-4">
                Fique por dentro do<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #E07B3A 0%, #C8612A 100%)' }}
                >
                  mercado imobiliário
                </span>
                <br />de Goiânia
              </h1>
              <p className="text-white/50 text-base mb-8">
                Conteúdo relevante direto para quem quer comprar, investir ou entender o mercado de imóveis na capital goiana.
              </p>

              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <p className="text-white/25 text-xs mt-8">
                Você pode cancelar quando quiser. Sem spam.
              </p>
            </div>

            {/* Right — form */}
            <div
              className="rounded-2xl p-8"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
            >
              {success ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(16,185,129,0.15)' }}
                  >
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h2 className="text-white font-bold text-xl mb-2">Cadastro realizado!</h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Em breve você receberá nosso conteúdo no e-mail e WhatsApp informados.
                  </p>
                  <Link
                    href="/blog"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ color: '#E07B3A' }}
                  >
                    Ver posts do blog
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-white font-bold text-xl mb-1">Cadastre-se gratuitamente</h2>
                  <p className="text-white/40 text-sm mb-6">Preencha os dados abaixo e comece a receber.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white/60 text-xs font-medium mb-1.5">Nome</label>
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={form.nome}
                        onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(224,123,58,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs font-medium mb-1.5">E-mail</label>
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(224,123,58,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs font-medium mb-1.5">WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="(62) 9 9999-9999"
                        value={form.whatsapp}
                        onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(224,123,58,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-xs">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                      style={{ background: '#E07B3A', boxShadow: '0 8px 30px rgba(224,123,58,0.3)' }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                      {loading ? 'Cadastrando...' : 'Quero receber novidades'}
                    </button>
                  </form>

                  <p className="text-white/20 text-xs text-center mt-4">
                    Sem spam. Cancele quando quiser.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
