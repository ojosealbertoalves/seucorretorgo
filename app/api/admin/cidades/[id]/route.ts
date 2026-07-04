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
    const data: { nome?: string; estado?: string; ativo?: boolean } = {}
    if (body.nome !== undefined) data.nome = body.nome.trim()
    if (body.estado !== undefined) data.estado = body.estado.trim() || 'GO'
    if (body.ativo !== undefined) data.ativo = body.ativo

    const cidade = await prisma.cidade.update({ where: { id }, data })
    return Response.json(cidade)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao atualizar cidade' }, { status: 500 })
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

    const vinculados = await prisma.empreendimento.count({ where: { cidadeId: id } })
    if (vinculados > 0) {
      return Response.json(
        { error: 'Existem empreendimentos vinculados a esta cidade. Reatribua-os antes de excluir.' },
        { status: 400 },
      )
    }

    await prisma.cidade.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao excluir. Verifique se não há bairros vinculados.' }, { status: 500 })
  }
}
