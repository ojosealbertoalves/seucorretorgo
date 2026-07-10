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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()
    const { nome, email, whatsapp, status, score, notas, empreendimentosInteresse } = body

    if (status && !STATUS_VALIDOS.includes(status)) {
      return Response.json({ error: 'Status inválido' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (nome !== undefined) data.nome = nome
    if (email !== undefined) data.email = email
    if (whatsapp !== undefined) data.whatsapp = whatsapp || null
    if (status !== undefined) data.status = status
    if (score !== undefined) data.score = Math.max(0, Math.min(10, Number(score)))
    if (notas !== undefined) data.notas = notas || null
    if (empreendimentosInteresse !== undefined) {
      data.empreendimentosInteresse = empreendimentosInteresse || null
    }

    const result = await prisma.lead.update({ where: { id }, data })
    return Response.json(result)
  } catch (error) {
    console.error('[PUT lead]', error)
    return Response.json({ error: 'Erro ao atualizar lead' }, { status: 500 })
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
    await prisma.lead.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
