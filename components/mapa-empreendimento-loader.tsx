'use client'

import dynamic from 'next/dynamic'

const MapaEmpreendimento = dynamic(() => import('./mapa-empreendimento'), {
  ssr: false,
})

export default MapaEmpreendimento
