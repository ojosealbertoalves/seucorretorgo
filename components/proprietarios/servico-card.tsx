'use client'

import { MessageCircle } from 'lucide-react'

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5562999999999'

type Props = {
  icon: React.ReactNode
  titulo: string
  descricao: string
  mensagemWhatsapp: string
}

export function ServicoCard({ icon, titulo, descricao, mensagemWhatsapp }: Props) {
  const href = `https://wa.me/${WA}?text=${encodeURIComponent(mensagemWhatsapp)}`

  return (
    <div
      className="group rounded-2xl p-8 flex flex-col gap-6 border border-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:border-[#C4622D]/25 hover:shadow-[0_8px_32px_rgba(196,98,45,0.08)]"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ background: '#F7ECE5' }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="text-white font-semibold text-lg leading-snug mb-3">{titulo}</h3>
        <p className="text-white/45 text-sm leading-relaxed">{descricao}</p>
      </div>

      {/* CTA */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 justify-center text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
        style={{ background: '#C4622D' }}
      >
        <MessageCircle size={16} />
        Falar sobre esse serviço
      </a>
    </div>
  )
}
