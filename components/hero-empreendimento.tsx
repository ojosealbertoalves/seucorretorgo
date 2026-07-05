'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'

type Foto = {
  url: string
  tipo: string
  legenda: string | null
}

type Props = {
  fotos: Foto[]
  nome: string
  statusLabel: string
  statusColor: string
  incorporadora: { nome: string; logo: string | null }
  localizacaoLabel: string | null
}

const THUMBS_MAX = 5

export function HeroEmpreendimento({ fotos, nome, statusLabel, statusColor, incorporadora, localizacaoLabel }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const heroFoto = fotos[0] as Foto | undefined

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % fotos.length))
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : (i - 1 + fotos.length) % fotos.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, fotos.length])

  return (
    <>
      <section className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
        {heroFoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroFoto.url}
            alt={heroFoto.legenda ?? nome}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: '#0F1F0F' }} />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(8,15,8,0.2) 0%, rgba(8,15,8,0.0) 40%, rgba(8,15,8,0.85) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            <span
              className="inline-flex w-fit items-center text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ background: statusColor }}
            >
              {statusLabel}
            </span>

            <h1 className="font-black text-white leading-tight text-3xl md:text-4xl lg:text-[3rem]">
              {nome}
            </h1>

            <div className="flex items-center gap-2">
              {incorporadora.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={incorporadora.logo}
                  alt={incorporadora.nome}
                  style={{ height: 32 }}
                  className="object-contain"
                />
              ) : (
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <Building2 size={16} className="text-white/70" />
                </span>
              )}
              <span className="text-white font-medium text-sm">{incorporadora.nome}</span>
            </div>

            {localizacaoLabel && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {localizacaoLabel}
              </p>
            )}
          </div>
        </div>
      </section>

      {fotos.length > 1 && (
        <div className="px-6 py-4" style={{ background: '#080F08' }}>
          <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-1">
            {fotos.slice(0, THUMBS_MAX).map((f, i) => {
              const remaining = fotos.length - THUMBS_MAX
              const showMore = i === THUMBS_MAX - 1 && remaining > 0
              return (
                <button
                  key={`${f.url}-${i}`}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="relative shrink-0 rounded-lg overflow-hidden"
                  style={{ width: 80, height: 60, border: '1px solid #1E3A1E' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.legenda ?? nome} className="w-full h-full object-cover" />
                  {showMore && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold"
                      style={{ background: 'rgba(8,15,8,0.75)' }}
                    >
                      +{remaining} fotos
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {lightboxIndex !== null && fotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(8,15,8,0.95)' }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X size={28} />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i === null ? i : (i - 1 + fotos.length) % fotos.length))
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i === null ? i : (i + 1) % fotos.length))
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                aria-label="Próxima foto"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotos[lightboxIndex].url}
            alt={fotos[lightboxIndex].legenda ?? nome}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
