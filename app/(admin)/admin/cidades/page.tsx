export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { CidadesTable } from '@/components/admin/cidades-table'

export default async function CidadesPage() {
  const cidades = await prisma.cidade.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { bairros: true, empreendimentos: true } } },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cidades e Bairros</h1>
      </div>

      <CidadesTable cidades={cidades} />
    </div>
  )
}
