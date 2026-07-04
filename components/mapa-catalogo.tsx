'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const STATUS_LABEL: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto',
}

function fmtPreco(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export type EmpreendimentoPin = {
  slug: string
  nome: string
  bairro: string | null
  cidade: string | null
  precoMin: number
  lotePrecoMin: number | null
  status: string
  incorporadora: { nome: string; logo: string | null }
  latitude: number
  longitude: number
}

type Props = {
  empreendimentos: EmpreendimentoPin[]
}

function popupHtml(e: EmpreendimentoPin) {
  const preco = e.lotePrecoMin && e.lotePrecoMin > 0 ? e.lotePrecoMin : e.precoMin
  const precoLabel = preco > 0 ? `A partir de ${fmtPreco(preco)}` : 'Consulte valores'
  const statusLabel = STATUS_LABEL[e.status] ?? e.status

  const incorporadoraHtml = e.incorporadora.logo
    ? `<img src="${e.incorporadora.logo}" alt="${e.incorporadora.nome}" style="height:32px;max-width:110px;object-fit:contain;border-radius:4px;" />`
    : `<span style="font-size:12px;font-weight:500;color:rgba(247,242,234,0.5);">${e.incorporadora.nome}</span>`

  return `
    <div style="width:220px;padding:12px;box-sizing:border-box;color:#F7F2EA;font-family:inherit;">
      <div style="margin-bottom:8px;">${incorporadoraHtml}</div>
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

export default function MapaCatalogo({ empreendimentos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [-16.6869, -49.2648],
      zoom: 11,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    for (const e of empreendimentos) {
      const popupEl = document.createElement('div')
      popupEl.innerHTML = popupHtml(e)

      L.marker([e.latitude, e.longitude], { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupEl, { minWidth: 220, maxWidth: 220 })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [empreendimentos])

  return <div ref={containerRef} className="w-full h-full" />
}
