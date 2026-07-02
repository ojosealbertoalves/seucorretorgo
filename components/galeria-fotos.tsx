'use client'

import { useState } from 'react'

type Foto = {
  url: string
  tipo: string
  legenda: string | null
}

type Props = {
  fotos: Foto[]
  nome: string
}

export function GaleriaFotos({ fotos, nome }: Props) {
  const [selected, setSelected] = useState(0)
  const foto = fotos[selected]

  if (fotos.length === 0) {
    return (
      <div
        className="w-full aspect-video rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-white/25 text-sm">Sem fotos disponíveis</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="w-full aspect-video rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto.url} alt={foto.legenda ?? nome} className="w-full h-full object-cover" />
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((f, i) => (
            <button
              key={`${f.url}-${i}`}
              onClick={() => setSelected(i)}
              className="shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-200"
              style={{
                border: i === selected ? '2px solid #E07B3A' : '2px solid transparent',
                opacity: i === selected ? 1 : 0.6,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.legenda ?? nome} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
