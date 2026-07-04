import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const cidades = await prisma.cidade.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { bairros: true, empreendimentos: true } } },
  })
  return Response.json(cidades)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const cidade = await prisma.cidade.create({
      data: {
        nome: body.nome?.trim(),
        estado: body.estado?.trim() || 'GO',
      },
    })
    return Response.json(cidade, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar cidade. Verifique se o nome já não está cadastrado.' }, { status: 500 })
  }
}
