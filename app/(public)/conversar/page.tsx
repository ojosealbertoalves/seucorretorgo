'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Send, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const STATUS_MAP: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto para morar',
}

const STATUS_COLOR: Record<string, string> = {
  LANCAMENTO: '#C4622D',
  EM_OBRAS: '#3b82f6',
  PRONTO: '#10b981',
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

type Foto = {
  url: string
  tipo: string
  legenda: string | null
}

type Tipologia = {
  id: string
  quartos: number
  suites: number
  banheiros: number
  areaPrivativa: number
  vagas: number
  preco: number
}

type CardData = {
  id: string
  slug: string
  nome: string
  bairro: string
  cidade: string
  status: string
  precoMin: number
  precoMax: number
  diferenciais: string[]
  destaqueIa: string
  incorporadora: { nome: string; logo: string | null }
  tipologias: Tipologia[]
  fotos: Foto[]
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  cards?: CardData[]
  isError?: boolean
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in-up">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ background: '#C4622D' }}
      >
        A
      </div>
      <div
        className="px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1"
        style={{ background: '#2D4A2D', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-white/40 text-xs mr-2">Alberto está digitando</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function PropertyCard({ card }: { card: CardData }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const photos = card.fotos.slice(0, 5)
  const current = photos[photoIdx] ?? null
  const mainTypo = card.tipologias[0]
  const badges = card.diferenciais.slice(0, 3)
  const statusColor = STATUS_COLOR[card.status] ?? '#C4622D'

  return (
    <div
      className="rounded-2xl overflow-hidden shrink-0 w-52 sm:w-64 flex flex-col animate-slide-in-right"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* ── FOTO ── */}
      <div className="w-full h-36 relative bg-gray-900 overflow-hidden">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={card.nome} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-white/20 text-base font-bold">G</span>
            </div>
            <span className="text-white/20 text-xs">Sem imagem</span>
          </div>
        )}

        {/* Gradient overlay bottom */}
        {current && (
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(26,46,26,0.7), transparent)' }}
          />
        )}

        {/* Status badge */}
        <span
          className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ background: `${statusColor}cc` }}
        >
          {STATUS_MAP[card.status] ?? card.status}
        </span>

        {/* Gallery controls */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              aria-label="Foto anterior"
            >
              <ChevronLeft size={14} className="text-white" />
            </button>
            <button
              onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              aria-label="Próxima foto"
            >
              <ChevronRight size={14} className="text-white" />
            </button>
            <span
              className="absolute bottom-1.5 right-2 text-white/60 font-medium"
              style={{ fontSize: '10px' }}
            >
              {photoIdx + 1}/{photos.length}
            </span>
          </>
        )}
      </div>

      {/* Caption */}
      {current?.legenda && (
        <p className="px-3 pt-1.5 text-white/35 text-xs italic truncate leading-tight">
          {current.legenda}
        </p>
      )}

      {/* ── CONTEÚDO ── */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-white font-semibold text-sm leading-tight truncate">{card.nome}</p>
          <p className="text-white/45 text-xs truncate mt-0.5">
            {card.incorporadora.nome} · {card.bairro}
          </p>
        </div>

        <p className="font-bold text-sm" style={{ color: '#C4622D' }}>
          R$ {fmt(card.precoMin)}
          {card.precoMin !== card.precoMax && ` – ${fmt(card.precoMax)}`}
        </p>

        {mainTypo && (
          <p className="text-white/50 text-xs">
            {mainTypo.quartos} qtos · {mainTypo.areaPrivativa}m² · {mainTypo.vagas} vaga
            {mainTypo.vagas !== 1 ? 's' : ''}
          </p>
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className="text-xs px-2 py-0.5 rounded-full text-white/50"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {b}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/catalogo/${card.slug}`}
          className="mt-auto block text-center text-xs font-semibold py-2 rounded-xl transition-all duration-200 hover:opacity-80 hover:scale-[1.02] text-white"
          style={{ background: '#C4622D' }}
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="flex flex-col items-end gap-1 max-w-xs sm:max-w-sm">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              background: '#C4622D',
              boxShadow: '0 4px 14px rgba(196,98,45,0.22)',
            }}
          >
            {message.content}
          </div>
          <span className="text-white/20 text-xs pr-1">{fmtTime(message.createdAt)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-in-up">
      <div className="flex items-end gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: '#C4622D' }}
        >
          A
        </div>
        <div className="flex flex-col gap-1 max-w-xs sm:max-w-sm md:max-w-md">
          {message.content ? (
            <div
              className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-wrap ${
                message.isError ? 'text-red-300' : 'text-white/90'
              }`}
              style={{
                background: message.isError ? 'rgba(239,68,68,0.12)' : '#2D4A2D',
                border: message.isError
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {message.content}
            </div>
          ) : null}
          <span className="text-white/20 text-xs pl-1">{fmtTime(message.createdAt)}</span>
        </div>
      </div>

      {message.cards && message.cards.length > 0 && (
        <div className="ml-10 flex gap-3 overflow-x-auto pb-2 pr-4">
          {message.cards.map((card) => (
            <PropertyCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Olá! Sou o Alberto, seu assistente especialista em imóveis novos em Goiânia. 😊\n\nEstou aqui para te ajudar a encontrar o imóvel perfeito, sem pressão e no seu ritmo.\n\nPor onde vamos começar? Você está procurando um apartamento ou uma casa?',
  createdAt: new Date(),
}

export default function ConversarPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const now = new Date()
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: now }
    const historyForApi = [...messages, userMsg]
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }))
    const assistantId = crypto.randomUUID()

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '', createdAt: new Date() },
    ])
    setInput('')
    setLoading(true)

    let pendingCards: CardData[] | undefined

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
      })

      if (!res.ok || !res.body) throw new Error('Falha na requisição')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''

        for (const part of parts) {
          const trimmed = part.trim()
          if (!trimmed.startsWith('data: ')) continue
          const raw = trimmed.slice(6).trim()

          if (raw === '[DONE]') {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId) return m
                const clean = m.content
                  .replace(/\[CARD:[^\]]*\]/g, '')
                  .replace(/\[LEAD:[^\]]*\]/g, '')
                  .trim()
                return { ...m, content: clean, cards: pendingCards }
              }),
            )
            continue
          }

          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'text') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + evt.delta } : m,
                ),
              )
            } else if (evt.type === 'cards') {
              pendingCards = evt.data as CardData[]
            } else if (evt.type === 'error') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: evt.message ?? 'Erro ao processar resposta.',
                        isError: true,
                      }
                    : m,
                ),
              )
            } else if (evt.type === 'lead') {
              const d = evt.data
              if (d?.nome && d?.email) {
                fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    nome: d.nome,
                    email: d.email,
                    whatsapp: d.whatsapp ?? '',
                    historicoJson: historyForApi,
                  }),
                })
                  .then(() => setToast('Contato salvo! O corretor entrará em contato em breve.'))
                  .catch(() => {})
              }
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.', isError: true }
            : m,
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const lastMsg = messages[messages.length - 1]
  const showTyping = loading && lastMsg?.role === 'assistant' && lastMsg?.content === ''

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: '#1A2E1A' }}>
      {/* ── TOAST ── */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm flex items-center gap-2 shadow-2xl animate-fade-in-up"
          style={{ background: '#059669', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <CheckCircle size={15} />
          {toast}
        </div>
      )}

      {/* ── HEADER ── */}
      <header
        className="shrink-0 flex items-center gap-3 px-4 h-16 border-b"
        style={{
          background: '#2D4A2D',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
      >
        <Link
          href="/"
          className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/08 transition-all duration-200"
        >
          <ArrowLeft size={18} />
        </Link>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: '#C4622D' }}
        >
          A
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">Alberto</p>
          <p className="text-white/40 text-xs leading-tight">Assistente Só Terrenos GO</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
          </span>
          <span className="text-emerald-400 text-xs font-medium">Online agora</span>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5"
        style={{ background: '#1A2E1A' }}
      >
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {showTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── INPUT ── */}
      <div
        className="shrink-0 px-4 py-3 border-t"
        style={{ background: '#2D4A2D', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Converse com o Alberto..."
              disabled={loading}
              maxLength={500}
              className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none disabled:opacity-50"
            />
            {input.length > 0 && (
              <span className="text-white/20 text-xs shrink-0 tabular-nums">
                {input.length}
              </span>
            )}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              style={{ background: '#C4622D' }}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-white/18 text-xs text-center mt-2">
            IA pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </div>
    </div>
  )
}
