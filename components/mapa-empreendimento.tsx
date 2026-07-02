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

type Props = {
  nome: string
  bairro: string
  latitude: number
  longitude: number
}

export default function MapaEmpreendimento({ nome, bairro, latitude, longitude }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      scrollWheelZoom: false,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    L.marker([latitude, longitude], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`<strong>${nome}</strong><br/>${bairro}`)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [nome, bairro, latitude, longitude])

  return <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
}
