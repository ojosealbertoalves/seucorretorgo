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

export type EmpreendimentoPinHero = {
  slug: string
  nome: string
  bairro: string
}

type Props = {
  empreendimentos: (EmpreendimentoPinHero & { latitude: number; longitude: number })[]
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
      popupEl.innerHTML = `
        <strong>${e.nome}</strong><br/>
        ${e.bairro}<br/>
        <a href="/catalogo/${e.slug}" style="color:#E07B3A;font-weight:600;">Ver →</a>
      `

      L.marker([e.latitude, e.longitude], { icon: pinIcon })
        .addTo(map)
        .bindPopup(popupEl)
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
