import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const incorporadoras = await prisma.incorporadora.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { empreendimentos: true } } },
  })
  return Response.json(incorporadoras)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const incorporadora = await prisma.incorporadora.create({ data: body })
    return Response.json(incorporadora, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar incorporadora' }, { status: 500 })
  }
}
