import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()
    const incorporadora = await prisma.incorporadora.update({ where: { id }, data: body })
    return Response.json(incorporadora)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao atualizar incorporadora' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.incorporadora.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao excluir. Verifique se não há empreendimentos vinculados.' }, { status: 500 })
  }
}
