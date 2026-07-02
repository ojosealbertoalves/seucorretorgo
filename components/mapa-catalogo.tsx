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

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export type EmpreendimentoPin = {
  slug: string
  nome: string
  bairro: string
  precoMin: number
  latitude: number
  longitude: number
}

type Props = {
  empreendimentos: EmpreendimentoPin[]
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
      popupEl.innerHTML = `
        <strong>${e.nome}</strong><br/>
        ${e.bairro}<br/>
        A partir de ${fmtPreco(e.precoMin)}<br/>
        <a href="/catalogo/${e.slug}" style="color:#E07B3A;font-weight:600;">Ver mais</a>
      `

      L.marker([e.latitude, e.longitude], { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupEl)
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [empreendimentos])

  return <div ref={containerRef} className="w-full h-full" />
}
