import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { IncorporadoraForm } from '@/components/admin/incorporadora-form'

export default async function EditarIncorporadoraPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const incorporadora = await prisma.incorporadora.findUnique({ where: { id } })
  if (!incorporadora) notFound()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Incorporadora</h1>
      <IncorporadoraForm initialData={incorporadora} />
    </div>
  )
}
