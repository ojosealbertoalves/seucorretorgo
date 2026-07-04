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

    const vinculados = await prisma.empreendimento.count({ where: { bairroId: id } })
    if (vinculados > 0) {
      return Response.json(
        { error: 'Existem empreendimentos vinculados a este bairro. Reatribua-os antes de excluir.' },
        { status: 400 },
      )
    }

    await prisma.bairro.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao excluir bairro' }, { status: 500 })
  }
}
