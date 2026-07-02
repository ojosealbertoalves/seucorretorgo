'use client'

import dynamic from 'next/dynamic'

const MapaCatalogo = dynamic(() => import('./mapa-catalogo'), {
  ssr: false,
})

export default MapaCatalogo
