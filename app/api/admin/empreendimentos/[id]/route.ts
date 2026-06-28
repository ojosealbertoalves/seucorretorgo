import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.empreendimento.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()
    const { tipologias, lotes, fotos, ...data } = body

    // slug is immutable — remove to avoid accidental overwrite
    delete data.slug

    const result = await prisma.$transaction(async (tx) => {
      await tx.tipologia.deleteMany({ where: { empreendimentoId: id } })
      await tx.lote.deleteMany({ where: { empreendimentoId: id } })
      await tx.foto.deleteMany({ where: { empreendimentoId: id } })
      return tx.empreendimento.update({
        where: { id },
        data: {
          ...data,
          tipologias: tipologias?.length ? { create: tipologias } : undefined,
          lotes: lotes?.length ? { create: lotes } : undefined,
          fotos: fotos?.length ? { create: fotos } : undefined,
        },
      })
    })

    return Response.json(result)
  } catch (error) {
    console.error('[PUT empreendimento]', error)
    return Response.json({ error: 'Erro ao atualizar empreendimento' }, { status: 500 })
  }
}
