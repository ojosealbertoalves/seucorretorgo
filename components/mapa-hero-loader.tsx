'use client'

import dynamic from 'next/dynamic'

const MapaHero = dynamic(() => import('./mapa-hero'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', background: '#0F1F0F', borderRadius: '12px' }} />,
})

export default MapaHero
