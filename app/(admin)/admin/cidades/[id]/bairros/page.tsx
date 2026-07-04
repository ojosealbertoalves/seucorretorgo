export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { BairrosTable } from '@/components/admin/bairros-table'

export default async function BairrosDaCidadePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cidade = await prisma.cidade.findUnique({
    where: { id },
    include: {
      bairros: {
        orderBy: { nome: 'asc' },
        include: { _count: { select: { empreendimentos: true } } },
      },
    },
  })

  if (!cidade) notFound()

  return (
    <div className="p-8">
      <Link href="/admin/cidades" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 mb-4">
        <ChevronLeft className="h-4 w-4" />
        Cidades
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Bairros de {cidade.nome}</h1>

      <BairrosTable cidadeId={cidade.id} bairros={cidade.bairros} />
    </div>
  )
}
