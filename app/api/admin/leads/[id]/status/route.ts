import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const STATUS_VALIDOS = [
  'novo',
  'em_contato',
  'qualificado',
  'visita_agendada',
  'proposta',
  'fechado',
  'descartado',
]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status || !STATUS_VALIDOS.includes(status)) {
      return Response.json({ error: 'Status inválido' }, { status: 400 })
    }

    const result = await prisma.lead.update({ where: { id }, data: { status } })
    return Response.json(result)
  } catch (error) {
    console.error('[PATCH lead status]', error)
    return Response.json({ error: 'Erro ao atualizar status' }, { status: 500 })
  }
}
