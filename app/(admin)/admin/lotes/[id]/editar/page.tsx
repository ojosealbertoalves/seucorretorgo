import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LoteForm, type FormPreset } from '@/components/admin/lote-form'

export default async function EditarLotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const { id } = await params

  const lote = await prisma.loteAnuncio.findUnique({
    where: { id },
    include: {
      fotos: { orderBy: { ordem: 'asc' } },
    },
  })

  if (!lote) notFound()

  const preset: FormPreset = {
    titulo: lote.titulo,
    slug: lote.slug,
    descricao: lote.descricao,
    bairro: lote.bairro,
    cidade: lote.cidade,
    area: lote.area,
    frente: lote.frente,
    preco: lote.preco,
    loteamentoId: lote.loteamentoId,
    ativo: lote.ativo,
    fotos: lote.fotos.map((f) => ({
      url: f.url,
      legenda: f.legenda,
    })),
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Lote</h1>
      <LoteForm editId={id} preset={preset} />
    </div>
  )
}
