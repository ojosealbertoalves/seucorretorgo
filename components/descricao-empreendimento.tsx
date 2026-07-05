'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

const LIMITE_CARACTERES = 500

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => <h1 className="text-2xl font-bold text-[#F7F2EA] mt-6 mb-3">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="text-xl font-bold text-[#F7F2EA] mt-5 mb-2">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="text-lg font-semibold text-[#F7F2EA] mt-4 mb-2">{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p className="leading-relaxed mb-5" style={{ color: 'rgba(247,242,234,0.9)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="pl-5 mb-5 space-y-2 list-disc" style={{ color: 'rgba(247,242,234,0.9)' }}>{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="pl-5 mb-5 space-y-2 list-decimal" style={{ color: 'rgba(247,242,234,0.9)' }}>{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="text-[#F7F2EA] font-semibold">{children}</strong>,
}

function truncar(texto: string, limite: number) {
  if (texto.length <= limite) return texto
  const corte = texto.lastIndexOf(' ', limite)
  return texto.slice(0, corte > 0 ? corte : limite) + '…'
}

export function DescricaoEmpreendimento({ texto }: { texto: string }) {
  const [expandido, setExpandido] = useState(false)
  const precisaTruncar = texto.length > LIMITE_CARACTERES
  const conteudo = expandido || !precisaTruncar ? texto : truncar(texto, LIMITE_CARACTERES)

  return (
    <div className="prose-blog">
      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
        {conteudo}
      </ReactMarkdown>
      {precisaTruncar && (
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: '#E07B3A' }}
        >
          {expandido ? 'Ler menos' : 'Ler mais'}
        </button>
      )}
    </div>
  )
}
