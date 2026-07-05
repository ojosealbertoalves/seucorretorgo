'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;background:#E07B3A;transform:rotate(-45deg);border:2px solid #F7F2EA;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 16],
  popupAnchor: [0, -18],
})

const STATUS_LABEL: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto',
}

function fmtPreco(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export type EmpreendimentoPinHero = {
  slug: string
  nome: string
  bairro: string | null
  cidade: string | null
  incorporadora: { nome: string; logo: string | null } | null
  precoMin: number
  lotePrecoMin: number | null
  status: string
}

type Props = {
  empreendimentos: (EmpreendimentoPinHero & { latitude: number; longitude: number })[]
}

function popupHtml(e: EmpreendimentoPinHero) {
  const preco = e.lotePrecoMin && e.lotePrecoMin > 0 ? e.lotePrecoMin : e.precoMin
  const precoLabel = preco > 0 ? `A partir de ${fmtPreco(preco)}` : 'Consulte valores'
  const statusLabel = STATUS_LABEL[e.status] ?? e.status

  const incorporadoraHtml = e.incorporadora?.logo
    ? `<img src="${e.incorporadora.logo}" alt="${e.incorporadora.nome}" style="height:32px;max-width:110px;object-fit:contain;border-radius:4px;" />`
    : e.incorporadora
      ? `<span style="font-size:12px;font-weight:500;color:rgba(247,242,234,0.5);">${e.incorporadora.nome}</span>`
      : ''

  return `
    <div style="width:220px;padding:12px;box-sizing:border-box;color:#F7F2EA;font-family:inherit;">
      ${incorporadoraHtml ? `<div style="margin-bottom:8px;">${incorporadoraHtml}</div>` : ''}
      <p style="margin:0 0 4px;font-weight:700;font-size:14px;line-height:1.3;color:#F7F2EA;">${e.nome}</p>
      ${[e.bairro, e.cidade].filter(Boolean).length > 0
        ? `<p style="margin:0 0 8px;font-size:12px;color:rgba(247,242,234,0.5);">${[e.bairro, e.cidade].filter(Boolean).join(' · ')}</p>`
        : ''}
      <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#E07B3A;">${precoLabel}</p>
      <span style="display:inline-block;margin-bottom:10px;font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:rgba(224,123,58,0.12);color:#E07B3A;">${statusLabel}</span>
      <a href="/catalogo/${e.slug}" style="display:block;width:100%;box-sizing:border-box;text-align:center;background:#E07B3A;color:white;font-weight:600;font-size:13px;padding:8px 0;border-radius:6px;text-decoration:none;">Ver empreendimento →</a>
    </div>
  `
}

export default function MapaHero({ empreendimentos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [-16.6869, -49.2648],
      zoom: 11,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    for (const e of empreendimentos) {
      const popupEl = document.createElement('div')
      popupEl.innerHTML = popupHtml(e)

      L.marker([e.latitude, e.longitude], { icon: pinIcon })
        .addTo(map)
        .bindPopup(popupEl, { minWidth: 220, maxWidth: 220 })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [empreendimentos])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {empreendimentos.length === 0 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-[1000]">
          <div
            className="px-4 py-2 rounded-full text-xs font-medium text-white/70"
            style={{ background: 'rgba(15,31,15,0.9)', border: '1px solid #1E3A1E' }}
          >
            Em breve: empreendimentos no mapa
          </div>
        </div>
      )}
    </div>
  )
}
