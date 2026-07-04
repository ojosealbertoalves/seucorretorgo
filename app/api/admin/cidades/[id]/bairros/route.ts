import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bairros = await prisma.bairro.findMany({
    where: { cidadeId: id },
    orderBy: { nome: 'asc' },
    include: { _count: { select: { empreendimentos: true } } },
  })
  return Response.json(bairros)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()
    const bairro = await prisma.bairro.create({
      data: {
        nome: body.nome?.trim(),
        cidadeId: id,
      },
    })
    return Response.json(bairro, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar bairro. Verifique se o nome já não está cadastrado nesta cidade.' }, { status: 500 })
  }
}
